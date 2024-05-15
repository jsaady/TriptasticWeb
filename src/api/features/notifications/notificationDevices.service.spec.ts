import { MikroORM } from '@mikro-orm/core';
import { Test, TestingModule } from '@nestjs/testing';
import { MockConfigModule } from '../../testFixtures/config.mock.js';
import { CreateMikroORM } from '../../testFixtures/mikroOrm.mock.js';
import { GeneratedConfig } from '../../utils/config/generated-config.entity.js';
import { User } from '../users/users.entity.js';
import { AddSubscriptionDTO, SendNotificationDTO } from './notification.dto.js';
import { NotificationDevicesService } from './notificationDevices.service.js';
import { Subscription } from './entities/subscription.entity.js';

describe('NotificationService', () => {
  let service: NotificationDevicesService;
  let module: TestingModule;
  let mikroOrm: MikroORM;
  const mockWebPush = {
    sendNotification: jest.fn(),
  };

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        ...CreateMikroORM([User, Subscription, GeneratedConfig]),
        MockConfigModule,
      ],
      providers: [
        NotificationDevicesService,
        { provide: 'WEB_PUSH', useValue: mockWebPush },
      ],
    }).compile();

    service = module.get<NotificationDevicesService>(NotificationDevicesService);
    mikroOrm = module.get<MikroORM>(MikroORM);
  });

  afterEach(async () => {
    await mikroOrm.em.nativeDelete(Subscription, {
      user: { id: 1 },
    });
  });

  afterAll(async () => {
    await module?.close();
  });


  describe('addSubscription', () => {
    it('should add a new subscription', async () => {
      const userId = 1;

      const subscriptionDto: AddSubscriptionDTO = {
        endpoint: 'https://example.com',
        keys: { p256dh: 'p256dh', auth: 'auth' },
      };

      const subscription = await service.addSubscription(userId, subscriptionDto);

      expect(subscription).toBeDefined();
      expect(subscription.id).toBeDefined();
      expect(subscription.user).toBeInstanceOf(User);
      expect(subscription.user.id).toBe(userId);
      expect(subscription.endpoint).toBe(subscriptionDto.endpoint);
      expect(subscription.keys).toEqual(subscriptionDto.keys);
    });
  });

  describe('removeSubscription', () => {
    it('should remove a subscription', async () => {
      const userId = 1;

      const subscriptionDto: AddSubscriptionDTO = {
        endpoint: 'https://example.com',
        keys: { p256dh: 'p256dh', auth: 'auth' },
      };

      const subscription = await service.addSubscription(userId, subscriptionDto);

      expect(subscription).toBeDefined();

      const result = await service.removeSubscription(userId);

      expect(result).toBeDefined();
      expect(result).toBeGreaterThan(0);
    });
  });

  describe('sendNotification', () => {
    it('should send a notification', async () => {
      const userId = 1;
      const subscriptionDto: AddSubscriptionDTO = {
        endpoint: 'https://example.com',
        keys: { p256dh: 'p256dh', auth: 'auth' },
      };

      await service.addSubscription(userId, subscriptionDto);
      const text = 'Hello, world!';
      const title = 'Test Notification';

      const sendNotificationDto: SendNotificationDTO = { userId, text, title };

      const result = await service.sendNotification(sendNotificationDto);

      expect(mockWebPush.sendNotification).toBeCalledTimes(1);

      expect(result).toBe(true);
    });

    it('should throw an error if user is not subscribed', async () => {
      const userId = 2;
      const text = 'Hello, world!';
      const title = 'Test Notification';

      const sendNotificationDto: SendNotificationDTO = { userId, text, title };

      await expect(service.sendNotification(sendNotificationDto)).rejects.toThrow('User not subscribed to notifications');
    });

    it('should handle when web push throws an error', async () => {
      const userId = 1;
      const subscriptionDto: AddSubscriptionDTO = {
        endpoint: 'https://example.com',
        keys: { p256dh: 'p256dh', auth: 'auth' },
      };

      await service.addSubscription(userId, subscriptionDto);
      const text = 'Hello, world!';
      const title = 'Test Notification';

      const sendNotificationDto: SendNotificationDTO = { userId, text, title };

      mockWebPush.sendNotification.mockImplementationOnce(() => {
        throw new Error('Test Error');
      });

      await expect(service.sendNotification(sendNotificationDto)).rejects.toThrow('Error sending notification');
    });
  });
});
