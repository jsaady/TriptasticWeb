import { MikroORM } from '@mikro-orm/core';
import { Logger } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module.js';
import { DefaultSeeder } from './db/seeds/DefaultSeeder.js';
import { ConfigService } from './utils/config/config.service.js';


(async () => {
  const app = await NestFactory.create(AppModule);

  const config = app.get(ConfigService);


  app.use(cookieParser(config.getOrThrow('cookieSecret')));

  // app.use(csurf());

  app.use(helmet());

  app.setGlobalPrefix('/api');

  app.enableShutdownHooks();

  await app.listen(process.env.PORT || 3000, '0.0.0.0');
})();
