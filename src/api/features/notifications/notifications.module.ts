import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { ConfigModule } from '../../utils/config/config.module.js';
import { AuthModule } from '../auth/auth.module.js';
import { Subscription } from './entities/subscription.entity.js';
import { UserNotificationPreference } from './entities/userNotificationPreference.entity.js';
import { UserStopNotificationPreference } from './entities/userStopNotificationPreference.entity.js';
import { NotificationGateway } from './notification.gateway.js';
import { NotificationDevicesController } from './notificationDevices.controller.js';
import { NotificationDevicesService } from './notificationDevices.service.js';
import { WEB_PUSH_PROVIDER } from './webPush.provider.js';
import { NotificationPreferencesController } from './notificationPreferences.controller.js';
import { NotificationPreferencesService } from './notificationPreferences.service.js';

@Module({
  imports: [
    ConfigModule,
    MikroOrmModule.forFeature([Subscription, UserNotificationPreference, UserStopNotificationPreference])
  ],
  controllers: [
    NotificationDevicesController,
    NotificationPreferencesController
  ],
  providers: [
    NotificationDevicesService,
    WEB_PUSH_PROVIDER,
    NotificationGateway,
    NotificationPreferencesService
  ],
  exports: [
    NotificationDevicesService,
    NotificationPreferencesService
  ]
})
export class NotificationsModule { }
