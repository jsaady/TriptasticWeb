import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import express from 'express';
import { resolve } from 'path';
import { AppModule } from './app.module.js';
import { DBService } from './db/db.service.js';

const currentDir = resolve(new URL(import.meta.url).pathname, '..');

(async () => {
  const app = await NestFactory.create(AppModule);

  const config = app.get(ConfigService);

  if (!config.get('SKIP_MIGRATIONS')) {
    const dbService = app.get(DBService);
    await dbService.up();
  }

  app.use(cookieParser());

  app.setGlobalPrefix('/api');

  app.use(express.static(resolve(currentDir, '..', 'ui')));

  app.enableShutdownHooks();

  await app.listen(process.env.PORT || 5000);
})();
