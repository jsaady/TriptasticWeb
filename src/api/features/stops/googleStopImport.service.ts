import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { JWT } from 'google-auth-library';
import * as googleSheet from 'google-spreadsheet';
import { ConfigService } from '../../utils/config/config.service.js';
import { CreateStopDTO, UpdateStopDTO } from './dto/stop.dto.js';
import { StopType } from './entities/stopType.enum.js';
import { StopsService } from './stops.service.js';
import { ScheduledQueue } from '@nestjs-enhanced/pg-boss';
import { Job } from 'pg-boss';
import { UserService } from '../users/users.service.js';
import { rootAdminEmail } from '../../db/seeds/AdminSeeder.js';
import { StopStatus } from './entities/stopStatus.enum.js';

@Injectable()
export class GoogleStopImportService {
  logger = new Logger('GoogleStopImportService');

  googleCreds: {
    client_email: string;
    private_key: string;
  };

  constructor(
    private config: ConfigService,
    private stopService: StopsService,
    private userService: UserService,
  ) {
    this.googleCreds = JSON.parse(Buffer.from(this.config.getOrThrow('googleCreds'), 'base64').toString('utf-8'));
  }

  async importStops(isJob?: boolean) {
    this.logger.log('Starting import');
    let creatorId: number | undefined;

    if (isJob) {
      const user = await this.userService.getUserByEmail(rootAdminEmail);

      if (!user) {
        throw new Error(`Failed to find user with email ${rootAdminEmail}`);
      }

      creatorId = user.id;
    }

    const auth = new JWT({
      email: this.googleCreds.client_email,
      key: this.googleCreds.private_key,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    })
    const spreadsheet = new googleSheet.GoogleSpreadsheet(this.config.getOrThrow('googleSpreadsheetId'), auth);
    await spreadsheet.loadInfo();
    const sheet = spreadsheet.sheetsByTitle['Route'];

    const existingStops = await this.stopService.getStopsByTrip(1, '', 0, true);

    const stopMapByImportId = new Map(existingStops.map(stop => [stop.importId, stop]));

    const newRows: CreateStopDTO[] = [];
    const updatedRows: UpdateStopDTO[] = [];
  
    for await (const row of await sheet.getRows()) {
      const date = new Date(row.get('Date'));
      // remove local timezone
      date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
      const importId = `${row.get('Stop')}-${row.get('Reason')}`;
      const existing = stopMapByImportId.get(importId);
      if (existing) {
        const {
          id,
          importId: _,
          ...rest
        } = existing;

        const partialUpdate = {
          desiredArrivalDate: date,
        };

        const dateChanged = partialUpdate.desiredArrivalDate.getTime() !== rest.desiredArrivalDate.getTime();

        if (!dateChanged) {
          continue;
        }

        this.logger.log(`Updating existing stop ${importId} with changes: ${dateChanged ? 'date' : ''}`);

        updatedRows.push({
          id: id,
          importId,
          ...rest,
        });
      } else {
        this.logger.log(`Creating stop ${importId}`);

        let [City, State] = row.get('Stop').split(', ');

        if (!City || !State) {
          this.logger.error(`Invalid stop: ${row.get('Stop')}`);
          continue;
        };

        let Country = 'US';
        if (['AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'NT', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT'].includes(State)) {
          switch (State) {
            case 'AB':
              State = 'Alberta';
              break;
            case 'BC':
              State = 'British Columbia';
              break;
            case 'MB':
              State = 'Manitoba';
              break;
            case 'NB':
              State = 'New Brunswick';
              break;
            case 'NL':
              State = 'Newfoundland and Labrador';
              break;
            case 'NS':
              State = 'Nova Scotia';
              break;
            case 'NT':
              State = 'Northwest Territories';
              break;
            case 'NU':
              State = 'Nunavut';
              break;
            case 'ON':
              State = 'Ontario';
              break;
            case 'PE':
              State = 'Prince Edward Island';
              break;
            case 'QC':
              State = 'Quebec';
              break;
            case 'SK':
              State = 'Saskatchewan';
              break;
            case 'YT':
              State = 'Yukon';
              break;
          }
          Country = 'CA'
        };

        const { data } = await axios.get<{ latitude: number; longitude: number }[]>(`https://api.api-ninjas.com/v1/geocoding?city=${City}&state=${State}&country=${Country}`, {
          headers: {
            'X-Api-Key': this.config.getOrThrow('ninjaApiKey'),
          },
        });

        await new Promise(resolve => setTimeout(resolve, 100));

        if (data.length === 0) {
          this.logger.error(`Failed to get coordinates for ${City}, ${State} ${Country}`);

          continue;
        } else if (data.length > 1) {
          this.logger.warn(`Multiple results for ${City}, ${State} ${Country}`);
          this.logger.warn(data);
        }

        let type: StopType;
        switch (row.get('Type')) {
          case 'Stop':
            type = StopType.PIT_STOP;
            break;
          case 'Special':
            type = StopType.HIDDEN_GEM;
            break;
          case 'Hockey':
            type = StopType.HOCKEY_CITY;
            break;
          default:
          case 'Park':
            type = StopType.NATIONAL_PARK;
            break;
        }

        newRows.push({
          importId,
          name: row.get('Stop'),
          notes: row.get('Reason'),
          desiredArrivalDate: date,
          latitude: data[0].latitude,
          longitude: data[0].longitude,
          actualArrivalDate: new Date(),
          type,
          status: StopStatus.UPCOMING,
        });
      }
    }

    if (newRows.length === 0 && updatedRows.length === 0) {
      this.logger.log('No changes detected');
    } else {
      await this.stopService.bulkAddStops(newRows, creatorId);
      await this.stopService.bulkUpdateStops(updatedRows, creatorId);
    }

    this.logger.log('Import complete');
    return;
  }

  @ScheduledQueue('*/10 * * * *')
  async scheduleImport(_: Job) {
    await this.importStops(true);
    return;
  }
}
