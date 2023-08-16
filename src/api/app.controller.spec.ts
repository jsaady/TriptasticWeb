import { Test } from '@nestjs/testing';
import { AppController } from './app.controller.js';
import { ConfigModule } from '@nestjs/config';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
      controllers: [AppController],
      providers: [],
    }).compile();

    appController = moduleRef.get(AppController);
  });

  it('should exist', () => {
    expect(appController).toBeDefined();
  });
});
