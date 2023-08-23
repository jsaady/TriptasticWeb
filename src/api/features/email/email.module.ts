import { Module } from '@nestjs/common';
import { EmailService } from './email.service.js';
import { NODE_MAILER_PROVIDER } from './nodeMailer.provider.js';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [EmailService, NODE_MAILER_PROVIDER],
  exports: [EmailService]
})
export class EmailModule { }
