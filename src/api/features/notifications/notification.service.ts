import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type WebPush from 'web-push';
import { CONFIG_VARS } from '../../utils/config.js';
import { User } from '../users/users.entity.js';
import { AddSubscriptionDTO, SendNotificationDTO } from './notification.dto.js';
import { Subscription } from './subscription.entity.js';
import { InjectWebPush } from './webPush.provider.js';

@Injectable()
export class NotificationService {
  readonly vapidPublic: string;
  readonly vapidSubject: string;
  private readonly vapidPrivate: string;
  constructor (
    private configService: ConfigService,
    @InjectWebPush() private webPush: typeof WebPush,
    @InjectRepository(Subscription) private subscriptionRepo: EntityRepository<Subscription>
  ) {
    this.vapidPublic = this.configService.getOrThrow(CONFIG_VARS.vapidPublic);
    this.vapidPrivate = this.configService.getOrThrow(CONFIG_VARS.vapidPrivate);
    this.vapidSubject = this.configService.getOrThrow(CONFIG_VARS.envUrl).replace('http:', 'https:');
  }

  async addSubscription(userId: number, subscriptionDto: AddSubscriptionDTO) {
    const newSubscription = this.subscriptionRepo.create({
      user: this.subscriptionRepo.getEntityManager().getReference(User, userId),
      endpoint: subscriptionDto.endpoint,
      keys: subscriptionDto.keys,
    });

    await this.subscriptionRepo.getEntityManager().flush()

    return newSubscription;
  }

  async removeSubscription(userId: number) {
    return this.subscriptionRepo.getEntityManager().createQueryBuilder(Subscription).delete({ user: { id: userId } }).execute();
  }

  async sendNotification({ userId, text }: SendNotificationDTO) {
    const sub = await this.subscriptionRepo.findOne({
      user: { id: userId }
    });

    if (!sub) {
      throw new BadRequestException('User not subscribed to notifications');
    }
    try {
      const payload = JSON.stringify({ title: text });
  
      await this.webPush.sendNotification({
        endpoint: sub.endpoint,
        keys: { p256dh: sub.keys.p256dh, auth: sub.keys.auth }
      }, payload, {
        vapidDetails: {
          subject: this.vapidSubject,
          privateKey: this.vapidPrivate,
          publicKey: this.vapidPublic
        }
      });
  
      return true;
    } catch (e) {
      console.error(e);

      throw new InternalServerErrorException('Error sending notification');
    }
  }
}
