import { EntityManager } from '@mikro-orm/postgresql';
import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import convert from 'heic-convert';
import sharp from 'sharp';
import { Attachment } from './entities/attachment.entity.js';
import { Thumbnail } from './entities/thumbnail.entity.js';

@Injectable()
export class AttachmentService {
  private logger = new Logger(AttachmentService.name);
  constructor(
    private em: EntityManager
  ) {}

  async getAttachment(id: number) {
    return this.em.findOneOrFail(Attachment, id);
  }

  async getThumbnail(id: number, px: number, isWidth: boolean) {
    const attachment = await this.getAttachment(+id);

    if (!attachment) {
      throw new NotFoundException('Attachment not found');
    }

    if (attachment.mimeType.startsWith('image/') === false) {
      throw new BadRequestException('Not an image');
    }
  
    const existingThumbnail = await this.em.findOne(Thumbnail, { attachment: attachment, [isWidth ? 'width' : 'height']: px });

    if (existingThumbnail) {
      return existingThumbnail;
    }

    try {
      this.logger.log(`Creating thumbnail for ${attachment.fileName}(${attachment.mimeType}) at ${px} ${isWidth ? 'width' : 'height'}`);

      if (attachment.mimeType === 'image/heic') {
        this.logger.log(`Converting HEIC to PNG for ${attachment.fileName}`);
        const converted = await convert({
          buffer: attachment.content,
          format: 'PNG',
          quality: 1
        });

        attachment.content = Buffer.from(converted);
        attachment.fileName = attachment.fileName.replace(/\.heic$/i, '.png');
        attachment.mimeType = 'image/png';
        attachment.size = converted.byteLength;

        await this.em.persistAndFlush(attachment);
      }
      
      const resizedContent = await sharp(attachment.content)
        .resize({
          [isWidth ? 'width' : 'height']: px,
          fit: 'contain'
        })
        .toBuffer();

      const thumbnail = new Thumbnail();
      thumbnail.attachment = attachment;
      thumbnail.content = resizedContent;
      thumbnail.fileName = `${isWidth ? 'w' : 'h'}-${px}-${attachment.fileName}`;
      thumbnail.mimeType = attachment.mimeType;
      thumbnail.size = resizedContent.byteLength;
      thumbnail[isWidth ? 'width' : 'height'] = px;

      await this.em.persistAndFlush(thumbnail);

      return thumbnail;
    } catch (e) {
      this.logger.error(`Error creating thumbnail for ${attachment.fileName} at ${px} ${isWidth ? 'width' : 'height'}`);

      this.logger.error(e);

      return attachment;
    }
  }
}
