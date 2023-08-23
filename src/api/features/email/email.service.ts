import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectNodeMailer } from './nodeMailer.provider.js';
import { Transport, Transporter } from 'nodemailer';
import { CONFIG_VARS } from '../../utils/config.js';

@Injectable()
export class EmailService {
  private readonly senderEmail: string;
  constructor (
    @InjectNodeMailer() private transport: Transporter,
    private config: ConfigService
  ) {
    this.senderEmail = config.getOrThrow(CONFIG_VARS.emailReplyTo);
  }

  sendEmail(email: string, subject: string, content: string) {
    return new Promise<any>((resolve, reject) => this.transport.sendMail({
      from: this.config.getOrThrow(CONFIG_VARS.emailUser),
      replyTo: this.senderEmail,
      to: email,
      subject,
      text: content
    }, (e: Error | null, info) => e ? reject(e) : resolve(info)));
  }
}