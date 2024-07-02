import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { PgBoss, ProcessQueue } from '@nestjs-enhanced/pg-boss';
import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { Job } from 'pg-boss';
import type WebPush from 'web-push';
import { ConfigService } from '../../utils/config/config.service.js';
import { User } from '../users/users.entity.js';
import { AddSubscriptionDTO, BatchNotificationDTO, SendNotificationDTO } from './notification.dto.js';
import { Subscription } from './entities/subscription.entity.js';
import { InjectWebPush } from './webPush.provider.js';

@Injectable()
export class NotificationDevicesService {
  private logger = new Logger(NotificationDevicesService.name);
  readonly vapidPublic: string;
  readonly vapidSubject: string;
  private readonly vapidPrivate: string;
  constructor (
    private configService: ConfigService,
    private pgBoss: PgBoss,
    @InjectWebPush() private webPush: typeof WebPush,
    @InjectRepository(Subscription) private subscriptionRepo: EntityRepository<Subscription>
  ) {
    this.vapidPublic = this.configService.getOrThrow('vapidPublic');
    this.vapidPrivate = this.configService.getOrThrow('vapidPrivate');
    this.vapidSubject = this.configService.getOrThrow('envUrl').replace('http:', 'https:');
  }

  async getDevices(userId: number) {
    return this.subscriptionRepo.find({
      user: { id: userId }
    });
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
        this.logger.error(`Error sending notification to user (${userId}#${sub.id})`);
        this.logger.error(e);
        throw e;
      }
    }

    return true;
  }

  async batchNotify(dto: BatchNotificationDTO) {
    this.pgBoss.send('process-batch-notification', dto);
  }

  @ProcessQueue('process-batch-notification')
  async processBatchNotification(job: Job<BatchNotificationDTO>) {
    const { title, text, userIds } = job.data;
    this.logger.log(`Sending batch notification to ${userIds.length} users`);
    
    for (const userId of userIds) {
      this.logger.log(`Sending batch notification to user (${userId})`);
      try {
        await this.sendNotification({ userId, title, text });
      } catch (e) {
        this.logger.log(`Error sending batch notification to user (${userId})`);
        this.logger.error(e);
      }
    }
  }
}
