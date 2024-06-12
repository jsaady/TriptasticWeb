import { BadRequestException, Controller, Get, NotFoundException, Param, Query, Res } from '@nestjs/common';
import { AttachmentService } from './attachment.service.js';
import { Response } from 'express';

@Controller('attachments')
export class AttachmentController {
  constructor(
    private attachmentService: AttachmentService,
  ) {}

  @Get(':id')
  async getAttachment(@Param('id') id: string, @Res() res: Response) {
    const attachment = await this.attachmentService.getAttachment(+id);

    res.setHeader('Content-Type', attachment.mimeType);
    res.setHeader('Content-Length', attachment.size.toString());
    res.setHeader('Content-Disposition', `inline; filename="${attachment.fileName}"`);
    res.send(attachment.content);

    return 'attachment';
  }

  @Get('thumb/:id')
  async getThumbnail(@Param('id') id: string, @Res() res: Response, @Query('w') width: string, @Query('h') height: string) {
    const attachment = await this.attachmentService.getAttachment(+id);

    if (!attachment) {
      throw new NotFoundException('Attachment not found');
    }

    if (attachment.mimeType.startsWith('image/') === false) {
      throw new BadRequestException('Not an image');
    }

    let px;
    let isWidth = true;
    if (width) {
      px = +width;
    } else if (height) {
      px = +height;
      isWidth = false;
    }

    if (!px) {
      throw new BadRequestException('Invalid size');
    }

    const content = await this.attachmentService.getThumbnail(attachment, px, isWidth);


    res.setHeader('Content-Type', attachment.mimeType);
    res.setHeader('Content-Length', content.byteLength.toString());
    res.setHeader('Content-Disposition', `inline; filename="${isWidth ? 'w' : 'h'}-${px}-${attachment.fileName}"`);
    res.send(content);
  }
}