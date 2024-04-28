import { Controller, Get, Param, Res } from '@nestjs/common';
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
}