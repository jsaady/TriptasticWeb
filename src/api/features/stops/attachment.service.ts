import { EntityManager } from '@mikro-orm/postgresql';
import { Injectable, Logger } from '@nestjs/common';
import { Attachment } from './entities/attachment.entity.js';
import sharp from 'sharp';

@Injectable()
export class AttachmentService {
  private logger = new Logger(AttachmentService.name);
  constructor(
    private em: EntityManager
  ) {}

  async getAttachment(id: number) {
    return this.em.findOneOrFail(Attachment, id);
  }

  async getThumbnail(attachment: Attachment, px: number, isWidth: boolean) {
    try {
      this.logger.log(`Creating thumbnail for ${attachment.fileName} at ${px} ${isWidth ? 'width' : 'height'}`);
      return sharp(attachment.content)
        .resize({
          [isWidth ? 'width' : 'height']: px,
          fit: 'contain'
        })
        .toBuffer();
    } catch (e) {
      this.logger.error(`Error creating thumbnail for ${attachment.fileName} at ${px} ${isWidth ? 'width' : 'height'}`);

      this.logger.error(e);

      return attachment.content;
    }
  }
}
