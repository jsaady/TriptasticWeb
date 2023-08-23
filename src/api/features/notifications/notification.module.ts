import { Module } from '@nestjs/common';
import { NotificationController } from './notification.controller.js';
import { NotificationService } from './notification.service.js';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Subscription } from './subscription.entity.js';
import { AuthModule } from '../auth/auth.module.js';
import { ConfigModule } from '@nestjs/config';
import { WEB_PUSH_PROVIDER } from './webPush.provider.js';

@Module({
  imports: [ConfigModule, MikroOrmModule.forFeature([Subscription]), AuthModule],
  controllers: [NotificationController],
  providers: [NotificationService, WEB_PUSH_PROVIDER],
  exports: [NotificationService]
})
export class NotificationModule { }
