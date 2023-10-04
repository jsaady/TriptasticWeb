import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import type WebPush from 'web-push';
import { ConfigService } from '../../utils/config/config.service.js';
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
    this.vapidPublic = this.configService.getOrThrow('vapidPublic');
    this.vapidPrivate = this.configService.getOrThrow('vapidPrivate');
    this.vapidSubject = this.configService.getOrThrow('envUrl').replace('http:', 'https:');
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
    return this.subscriptionRepo.getEntityManager().nativeDelete(Subscription, { user: { id: userId } });
  }

  async sendNotification({ userId, text, title }: SendNotificationDTO) {
    const subs = await this.subscriptionRepo.find({
      user: { id: userId }
    });

    if (!subs?.length) {
      throw new BadRequestException('User not subscribed to notifications');
    }

    for (const sub of subs) {
      try {
        const payload = JSON.stringify({ title, text });
    
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
      } catch (e) {
        console.error(e);
        
        throw new InternalServerErrorException('Error sending notification');
      }
    }

    return true;
  }
}
