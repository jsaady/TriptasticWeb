import { BadRequestException, Controller, Get, Param, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { AttachmentService } from './attachment.service.js';

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
    res.setHeader('Cache-Control', 'max-age=604800');
    res.send(attachment.content);

    return 'attachment';
  }

  @Get('thumb/:id')
  async getThumbnail(@Param('id') id: string, @Res() res: Response, @Query('w') width: string, @Query('h') height: string) {
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

    const thumbnail = await this.attachmentService.getThumbnail(+id, px, isWidth);

    res.setHeader('Content-Type', thumbnail.mimeType);
    res.setHeader('Content-Length', thumbnail.size.toString());
    res.setHeader('Content-Disposition', `inline; filename="${thumbnail.fileName}"`);
    res.setHeader('Cache-Control', 'max-age=604800');
    res.send(thumbnail.content);
  }
}