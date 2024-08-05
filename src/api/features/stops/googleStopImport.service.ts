import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { JWT } from 'google-auth-library';
import * as googleSheet from 'google-spreadsheet';
import { Job } from 'pg-boss';
import { rootAdminEmail } from '../../db/seeds/AdminSeeder.js';
import { ConfigService } from '../../utils/config/config.service.js';
import { UserService } from '../users/users.service.js';
import { CreateStopDTO, UpdateStopDTO } from './dto/stop.dto.js';
import { StopStatus } from './entities/stopStatus.enum.js';
import { StopType } from './entities/stopType.enum.js';
import { StopsService } from './stops.service.js';

@Injectable()
export class GoogleStopImportService {
  private logger = new Logger('GoogleStopImportService');

  constructor(
    private config: ConfigService,
    private stopService: StopsService,
    private userService: UserService,
  ) { }

  async importStops(isJob?: boolean) {
    this.logger.log('Starting import');

    const googleSpreadsheetId = this.config.getOrThrow('googleSpreadsheetId');
    const rawGoogleCreds = this.config.getOrThrow('googleCreds');

    if (!rawGoogleCreds || !googleSpreadsheetId) {
      this.logger.warn('Missing google creds or spreadsheet id');
      return;
    }
    const googleCreds = JSON.parse(Buffer.from(this.config.getOrThrow('googleCreds'), 'base64').toString('utf-8'));

    let creatorId: number | undefined;

    if (isJob) {
      const user = await this.userService.getUserByEmail(rootAdminEmail);

      if (!user) {
        throw new Error(`Failed to find user with email ${rootAdminEmail}`);
      }

      creatorId = user.id;
    }

    const auth = new JWT({
      email: googleCreds.client_email,
      key: googleCreds.private_key,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const spreadsheet = new googleSheet.GoogleSpreadsheet(googleSpreadsheetId, auth);
    await spreadsheet.loadInfo();
    const sheet = spreadsheet.sheetsByTitle['NewRoute'];

    const existingStops = await this.stopService.getStopsByTrip(1, true, '', 0, true);

    const stopMapByImportId = new Map(existingStops.map(stop => [stop.importId, stop]));
    const undetectedStops = new Map(existingStops.map(stop => [stop.importId, stop]));

    const newRows: CreateStopDTO[] = [];
    const updatedRows: UpdateStopDTO[] = [];
  
    let sortOrder = 0;

    for await (const row of await sheet.getRows()) {
      const date = new Date(row.get('Date'));
      // remove local timezone
      date.setHours(date.getHours() - date.getTimezoneOffset() / 60);
      date.setMinutes(0);
      date.setSeconds(0);
      date.setMilliseconds(0);

      const importId = `${row.get('Stop')}-${row.get('Reason')}`;
      const existing = stopMapByImportId.get(importId);

      sortOrder++;

      if (existing) {
        undetectedStops.delete(importId);

        const {
          id,
          importId: _,
          ...rest
        } = existing;

        const dateChanged = date.getTime() !== rest.desiredArrivalDate.getTime();
        const sortOrderChanged = sortOrder && (sortOrder !== rest.sortOrder);

        if (!dateChanged && !sortOrderChanged) {
          continue;
        }

        this.logger.log(`Updating existing stop ${importId} with changes: ${dateChanged ? 'date' : ''} ${sortOrderChanged ? 'sortOrder' : ''}`);

        updatedRows.push({
          id: id,
          importId,
          ...rest,
          sortOrder,
          desiredArrivalDate: dateChanged ? date : rest.desiredArrivalDate,
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
          sortOrder: sortOrder,
        });
      }
    }

    for (const [importId, stop] of undetectedStops) {
      if (stop.status === StopStatus.ARCHIVED) {
        continue;
      }

      this.logger.log(`Deleting stop ${importId}`);

      stop.status = StopStatus.ARCHIVED;
      updatedRows.push(stop);
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

  // @ScheduledQueue('*/5 * * * *')
  async scheduleImport(_: Job) {
    try {
      await this.importStops(true);
    } catch (e) {
      this.logger.error('Failed to import stops');
      this.logger.error(e);
    }
    return;
  }
}
