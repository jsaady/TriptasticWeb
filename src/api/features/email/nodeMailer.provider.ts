import NodeMailer from 'nodemailer';
import { Inject, Provider } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import SMTPTransport from 'nodemailer/lib/smtp-transport/index.js';
import { CONFIG_VARS } from '../../utils/config.js';

const NODE_MAILER = 'NODE_MAILER';

export const NODE_MAILER_PROVIDER: Provider = {
  provide: NODE_MAILER,
  useFactory: (config: ConfigService) => {
    const host = config.getOrThrow(CONFIG_VARS.emailHost);
    const port = config.getOrThrow(CONFIG_VARS.emailPort);
    const user = config.getOrThrow(CONFIG_VARS.emailUser);
    const pass = config.getOrThrow(CONFIG_VARS.emailPassword);

    return NodeMailer.createTransport({
      host,
      port,
      auth: {
        user,
        pass
      }
    })
  },
  inject: [ConfigService]
}

export const InjectNodeMailer = () => Inject(NODE_MAILER);
