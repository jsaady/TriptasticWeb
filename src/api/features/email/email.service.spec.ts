import { Test, TestingModule } from '@nestjs/testing';
import { Transporter } from 'nodemailer';
import { MockConfigModule } from '../../testFixtures/config.mock.js';
import { EmailService } from './email.service.js';
import { NODE_MAILER_PROVIDER } from './nodeMailer.provider.js';

describe('EmailService', () => {
  let service: EmailService;
  let module: TestingModule;
  const transport = {
    sendMail: jest.fn().mockImplementation((_: any, callback: Function) => {
      callback(null, { messageId: '123' });
    })
  };

  afterAll(async () => {
    await module?.close();
  });

  beforeEach(async () => {
    const nodeMailerToken = (NODE_MAILER_PROVIDER as any).provide;
    module = await Test.createTestingModule({
      imports: [
        // ...CreateMikroORM([]),
        MockConfigModule,
      ],
      providers: [
        EmailService,
        {
          provide: nodeMailerToken,
          useValue: transport,
        },
      ],
    }).compile();

    service = module.get<EmailService>(EmailService);
  });

  describe('sendEmail', () => {
    it('should send an email', async () => {
      const email = 'test@example.com';
      const subject = 'Test Subject';
      const content = 'Test Content';


      await service.sendEmail(email, subject, content);

      expect(transport.sendMail).toHaveBeenCalledWith({
        from: expect.any(String),
        replyTo: expect.any(String),
        to: email,
        subject,
        text: content,
      }, expect.any(Function));
    });

    it('should reject if there is an error', async () => {
      const email = 'test@example.com';
      const subject = 'Test Subject';
      const content = 'Test Content';

      transport.sendMail.mockImplementationOnce(((_: any, callback: Function) => {
        callback(new Error('Test Error'), null);
      }) as any);

      await expect(service.sendEmail(email, subject, content)).rejects.toThrow(
        'Test Error',
      );
    });
  });
});
