import { Body, Controller, Delete, Get, Post } from '@nestjs/common';
import { AddSubscriptionDTO, SendNotificationDTO } from './notification.dto.js';
import { User } from '../auth/user.decorator.js';
import { AuthTokenContents } from '../auth/auth.dto.js';
import { AllowUnauthenticated, IsAuthenticated } from '../auth/isAuthenticated.guard.js';
import { NotificationService } from './notification.service.js';

@Controller('notifications')
@IsAuthenticated()
export class NotificationController {
  constructor (
    private notificationService: NotificationService
  ) { }

  @Post('subscribe')
  async subscribe (@Body() subscription: AddSubscriptionDTO, @User() { sub }: AuthTokenContents) {
    return this.notificationService.addSubscription(sub, subscription);
  }

  @Post('unsubscribe')
  async unsubscribe(@User() { sub }: AuthTokenContents) {
    return this.notificationService.removeSubscription(sub);
  }

  @Post('send')
  @AllowUnauthenticated()
  async sendNotification (@Body() sendNotificationDto: SendNotificationDTO) {
    await this.notificationService.sendNotification(sendNotificationDto);

    return { success: true };
  }

  @Get('vapid')
  getPublicVapidKey() {
    return {
      publicKey: this.notificationService.vapidPublic,
      subject: this.notificationService.vapidSubject
    };
  }
}
