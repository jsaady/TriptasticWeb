import { Body, Controller, Get, Post } from '@nestjs/common';
import { AuthTokenContents } from '../auth/auth.dto.js';
import { IsAuthenticated } from '../auth/isAuthenticated.guard.js';
import { User } from '../auth/user.decorator.js';
import { AddSubscriptionDTO } from './notification.dto.js';
import { NotificationDevicesService } from './notificationDevices.service.js';

@Controller('notifications/devices')
@IsAuthenticated()
export class NotificationDevicesController {
  constructor (
    private notificationService: NotificationDevicesService
  ) { }

  @Get()
  async getDevices(@User() { sub }: AuthTokenContents) {
    return this.notificationService.getDevices(sub);
  }

  @Post('subscribe')
  async subscribe (@Body() subscription: AddSubscriptionDTO, @User() { sub }: AuthTokenContents) {
    return this.notificationService.addSubscription(sub, subscription);
  }

  @Post('unsubscribe')
  async unsubscribe(@User() { sub }: AuthTokenContents) {
    return this.notificationService.removeSubscription(sub);
  }

  @Get('vapid')
  getPublicVapidKey() {
    return {
      publicKey: this.notificationService.vapidPublic,
      subject: this.notificationService.vapidSubject
    };
  }
}
