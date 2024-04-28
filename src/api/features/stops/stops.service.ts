import { wrap } from '@mikro-orm/core';
import { EntityManager } from '@mikro-orm/postgresql';
import { Injectable, NotFoundException } from '@nestjs/common';
import { AuthService } from '../auth/auth.service.js';
import { User } from '../users/users.entity.js';
import { AttachmentDTO } from './dto/attachment.dto.js';
import { StopDTO } from './dto/stop.dto.js';
import { Attachment } from './entities/attachment.entity.js';
import { Stop } from './entities/stop.entity.js';
import { Trip } from './entities/trip.entity.js';

@Injectable()
export class StopsService {
  constructor(
    private em: EntityManager,
    private auth: AuthService,
  ) {}

  async create(stopDto: Pick<Stop, 'latitude'|'longitude'|'name'>): Promise<Stop> {
    const stop = wrap(new Stop()).assign(stopDto);
    stop.creator = this.em.getReference(User, this.auth.getCurrentUserId());
    stop.trip = this.em.getReference(Trip, 1);
    await this.em.persist(stop).flush();

    return stop;
  }

  async delete(id: number): Promise<Stop> {
    const stop = await this.em.findOne(Stop, { id });

    if (!stop) throw new NotFoundException(`Stop not found`);

    await this.em.removeAndFlush(stop);

    return stop;
  }

  async detachAttachment(stopId: number, attachmentId: number): Promise<Stop> {
    const stop = await this.em.findOne(Stop, { id: stopId }, { populate: true });
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

    const attachments = files.map(file => {
      const attachment = new Attachment();
      attachment.fileName = file.originalname;
      attachment.mimeType = file.mimetype;
      attachment.size = file.size;
      attachment.content = file.buffer;

      stop.attachments.add(attachment);

      return attachment;
    });

    await this.em.persistAndFlush(attachments);

    return stop;
  }

  async getStopsByTrip(tripId: number): Promise<StopDTO[]> {
    const stops = await this.em.find(Stop, { trip: this.em.getReference(Trip, tripId) }, { fields: ['id', 'name', 'latitude', 'longitude', 'createdAt'] });

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

  async update(id: number, stopDto: Pick<Stop, 'latitude'|'longitude'|'name'|'notes'>): Promise<Stop> {
    const stop = await this.em.findOne(Stop, { id });

    if (!stop) throw new NotFoundException(`Stop not found`);

    Object.assign(stop, stopDto);

    await this.em.flush();

    return stop;
  }
}
