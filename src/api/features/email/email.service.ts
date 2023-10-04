import { Injectable } from '@nestjs/common';
import { Transporter } from 'nodemailer';
import { CONFIG_VARS } from '../../utils/config/config.js';
import { InjectNodeMailer } from './nodeMailer.provider.js';
import { ConfigService } from '../../utils/config/config.service.js';

@Injectable()
export class EmailService {
  private readonly senderEmail: string;
  constructor (
    @InjectNodeMailer() private transport: Transporter,
    private config: ConfigService
  ) {
    this.senderEmail = config.getOrThrow('emailReplyTo');
  }

  sendEmail(email: string, subject: string, content: string) {
    return new Promise<any>((resolve, reject) => this.transport.sendMail({
      from: this.config.getOrThrow('emailUser'),
      replyTo: this.senderEmail,
      to: email,
      subject,
      text: content
    }, (e: Error | null, info) => {
      if (e) {
        return reject(e);
      }
      
      return resolve(info);
    }));
  }
}