import { Injectable, Logger } from '@nestjs/common';
import { Transporter } from 'nodemailer';
import { CONFIG_VARS } from '../../utils/config/config.js';
import { InjectNodeMailer } from './nodeMailer.provider.js';
import { ConfigService } from '../../utils/config/config.service.js';

@Injectable()
export class EmailService {
  private readonly senderEmail: string;
  logger = new Logger('EmailService');

  constructor (
    @InjectNodeMailer() private transport: Transporter,
    private config: ConfigService
  ) {
    this.senderEmail = config.getOrThrow('emailReplyTo');
  }

  sendEmail(email: string, subject: string, content: string) {
    this.logger.log(`Sending email to ${email} with subject ${subject}`);

    return new Promise<any>((resolve, reject) => this.transport.sendMail({
      from: this.config.getOrThrow('emailUser'),
      replyTo: this.senderEmail,
      to: email,
      subject,
      text: content
    }, (e: Error | null, info) => {
      if (e) {
        this.logger.error(`Error sending email to ${email} with subject ${subject}`);
        this.logger.error(e);
        return reject(e);
      }

      this.logger.log(`Email sent to ${email} with subject ${subject}`);
      this.logger.log(info);
      
      return resolve(info);
    }));
  }
}