import { wrap } from '@mikro-orm/core';
import { EntityManager } from '@mikro-orm/postgresql';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { AuthService } from '../auth/auth.service.js';
import { NotificationDevicesService } from '../notifications/notificationDevices.service.js';
import { NotificationPreferencesService } from '../notifications/notificationPreferences.service.js';
import { User } from '../users/users.entity.js';
import { AttachmentDTO } from './dto/attachment.dto.js';
import { CreateStopDTO, StopDetailDTO, StopListDTO, UpdateStopDTO } from './dto/stop.dto.js';
import { Attachment } from './entities/attachment.entity.js';
import { Stop } from './entities/stop.entity.js';
import { StopStatus } from './entities/stopStatus.enum.js';
import { Trip } from './entities/trip.entity.js';
import convert from 'heic-convert';
import { wrapWithLabels } from '../../instrumentation.cjs';

@Injectable()
export class StopsService {
  private readonly logger = new Logger(StopsService.name);

  constructor(
    private em: EntityManager,
    private auth: AuthService,
    private userNotificationService: NotificationPreferencesService,
    private notificationService: NotificationDevicesService,
  ) {}

  async create(stopDto: CreateStopDTO): Promise<Stop> {
    const stop = wrap(new Stop()).assign(stopDto);
    stop.creator = this.em.getReference(User, this.auth.getCurrentUserId());
    stop.trip = this.em.getReference(Trip, 1);
    if (stop.desiredArrivalDate < new Date()) {
      stop.status = StopStatus.COMPLETED;
    }
    await this.em.persist(stop).flush();

    return stop;
  }

  async delete(id: number): Promise<Stop> {
    const stop = await this.em.findOne(Stop, { id });

    if (!stop) throw new NotFoundException(`Stop not found`);

    await this.em.removeAndFlush(stop);

    return stop;
  }

  async detachAttachment(stopId: number, attachmentId: number): Promise<StopDetailDTO> {
    const stop = await this.em.findOne(Stop, { id: stopId }, { populate: ['attachments'] });
    if (!stop) throw new NotFoundException(`Stop not found`);

    const attachment = stop.attachments.getItems().find(a => a.id === attachmentId);

    if (!attachment) throw new NotFoundException(`Attachment not found`);

    stop.attachments.remove(attachment);
    this.em.remove(attachment);

    await this.em.flush();

    return stop;
  }

  async attachFiles(stopId: number, files: Express.Multer.File[]): Promise<Stop> {
    const stop = await this.em.findOne(Stop, { id: stopId });

    if (!stop) throw new NotFoundException(`Stop not found`);

    const attachments: Attachment[] = [];

    for (let file of files) {
      const attachment = new Attachment();
      if (file.mimetype.endsWith('heic')) {
        this.logger.log(`Converting HEIC to PNG for ${file.originalname}`);
        const data = await convert({
          buffer: file.buffer,
          format: 'PNG',
          quality: 1,
        });

        attachment.fileName = file.originalname.replace(/\.heic$/i, 'png');
        attachment.mimeType = 'image/png';
        attachment.size = data.byteLength;
        attachment.content = Buffer.from(data);
      } else {
        attachment.fileName = file.originalname;
        attachment.mimeType = file.mimetype;
        attachment.size = file.size;
        attachment.content = file.buffer;
      }

      stop.attachments.add(attachment);
      attachments.push(attachment);
    }

    await this.em.persistAndFlush(attachments);

    return stop;
  }

  async getStopsByTrip(tripId: number, includeArchived: boolean, q?: string, limit?: number): Promise<StopListDTO[]>
  async getStopsByTrip(tripId: number, includeArchived: boolean, q: string, limit: number, includeNotes: false): Promise<StopListDTO[]>
  async getStopsByTrip(tripId: number, includeArchived: boolean, q: string, limit: number, includeNotes: true): Promise<StopDetailDTO[]>
  async getStopsByTrip(tripId: number, includeArchived: boolean, q: string, limit: number, includeNotes?: boolean): Promise<StopListDTO[]|StopDetailDTO[]> {
    const stops = await this.em.find(Stop, {
      trip: this.em.getReference(Trip, tripId),
      status: !includeArchived ? { $ne: StopStatus.ARCHIVED } : { $in: [StopStatus.ARCHIVED, StopStatus.COMPLETED, StopStatus.ACTIVE, StopStatus.UPCOMING] },
      ...q ? {
        $or: [
          { name: { $ilike: `%${q}%` } },
          { notes: { $ilike: `%${q}%` } },
        ],
      } : {},
    }, {
      limit: limit || undefined,
      orderBy: [{ desiredArrivalDate: 'ASC' }, { sortOrder: 'ASC' }],
      fields: [
        'status',
        'id',
        'name',
        'latitude',
        'longitude',
        'createdAt',
        'updatedAt',
        'type',
        'desiredArrivalDate',
        'actualArrivalDate',
        'importId',
        'sortOrder',
        ...(includeNotes ? ['notes' as const] : [])]
      });

    return stops;
  }

  async getAttachments(stopId: number): Promise<AttachmentDTO[]> {
    const attachments = await this.em.find(Attachment, { stop: stopId }, { populate: ['id', 'createdAt', 'mimeType', 'size', 'fileName'] });

    return attachments.map(a => ({
      id: a.id,
      createdAt: a.createdAt.toISOString(),
      mimeType: a.mimeType,
      size: a.size,
      fileName: a.fileName,
    }));
  }

  async getStopById(id: number): Promise<Stop> {
    const stop = await this.em.findOne(Stop, { id });

    if (!stop) throw new NotFoundException(`Stop not found`);

    return stop;
  }

  async update(id: number, stopDto: UpdateStopDTO): Promise<Stop> {
    const stop = await this.em.findOne(Stop, { id });

    if (!stop) throw new NotFoundException(`Stop not found`);

    Object.assign(stop, stopDto);

    await this.em.flush();

    return stop;
  }

  async bulkAddStops(stops: CreateStopDTO[], creatorId = this.auth.getCurrentUserId()): Promise<Stop[]> {
    const trip = this.em.getReference(Trip, 1);
    const creator = this.em.getReference(User, creatorId);

    const stopEntities = stops.map(stop => {
      const stopEntity = wrap(new Stop()).assign(stop);

      stopEntity.trip = trip;
      stopEntity.creator = creator;

      return stopEntity;
    });

    await this.em.persistAndFlush(stopEntities);

    return stopEntities;
  }

  async bulkUpdateStops(stops: UpdateStopDTO[], creatorId = this.auth.getCurrentUserId()): Promise<Stop[]> {
    const stopEntities = await this.em.find(Stop, { id: { $in: stops.map(s => s.id) } });

    const stopMap = new Map(stops.map(s => [s.id, s]));

    const trip = this.em.getReference(Trip, 1);
    const creator = this.em.getReference(User, creatorId);

    stopEntities.forEach((stop, index) => {
      const stopUpdate = stopMap.get(stop.id);

      if (!stopUpdate) {
        this.logger.warn(`Stop with id ${stop.id} not found in update list`);
        return;
      }

      Object.assign(stop, stopUpdate);
      stop.creator = creator;
      stop.trip = trip;
    });

    await this.em.flush();

    return stopEntities;
  }

  async checkIntoStop(id: number): Promise<Stop> {
    const stop = await this.em.findOne(Stop, { id });

    if (!stop) throw new NotFoundException(`Stop not found`);

    const existingCheckedInStop = await this.em.findOne(Stop, { trip: stop.trip, status: StopStatus.ACTIVE });

    if (existingCheckedInStop) {
      existingCheckedInStop.status = StopStatus.COMPLETED;
    }

    stop.actualArrivalDate = new Date();
    stop.status = StopStatus.ACTIVE;

    await this.em.flush();

    return stop;
  }

  async notifySubscribers(stopId: number): Promise<void> {
    const userIds = await this.userNotificationService.getUserIdsToNotify(stopId);
    const stop = await this.getStopById(stopId);

    await this.notificationService.batchNotify({
      title: 'Stop Updated',
      text: `"${stop.name}" has been updated`,
      userIds,
    });
  }

  async archiveStop(id: number): Promise<Stop> {
    const stop = await this.em.findOne(Stop, { id });

    if (!stop) throw new NotFoundException(`Stop not found`);

    stop.status = StopStatus.ARCHIVED;

    await this.em.flush();

    return stop;
  }
}
