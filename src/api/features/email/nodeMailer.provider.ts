import { Inject, Provider } from '@nestjs/common';
import NodeMailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport/index.js';
import { ConfigService } from '../../utils/config/config.service.js';

const NODE_MAILER = 'NODE_MAILER';

export const NODE_MAILER_PROVIDER: Provider = {
  provide: NODE_MAILER,
  useFactory: (config: ConfigService) => {
    const host: any = config.getOrThrow('emailHost');
    const port: any = config.getOrThrow('emailPort');
    const user: any = config.getOrThrow('emailUser').trim();
    const pass: any = config.getOrThrow('emailPassword').trim();

    const smtpOptions: SMTPTransport.Options = {
      host,
      port,
      auth: {
        user,
        pass,
      }
    };
    return NodeMailer.createTransport(smtpOptions)
  },
  inject: [ConfigService]
}

export const InjectNodeMailer = () => Inject(NODE_MAILER);
