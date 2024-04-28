import { EntityManager } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { Attachment } from './entities/attachment.entity.js';

@Injectable()
export class AttachmentService {
  constructor(
    private em: EntityManager
  ) {}

  async getAttachment(id: number) {
    return this.em.findOneOrFail(Attachment, id);
  }
}