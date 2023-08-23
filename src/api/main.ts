import { MikroORM } from '@mikro-orm/core';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import express from 'express';
import helmet from 'helmet';
import { resolve } from 'path';
import { AppModule } from './app.module.js';
import { DefaultSeeder } from './db/seeds/DefaultSeeder.js';
import { CONFIG_VARS } from './utils/config.js';

const currentDir = resolve(new URL(import.meta.url).pathname, '..');

(async () => {
  const app = await NestFactory.create(AppModule);

  const config = app.get(ConfigService);

  if (!config.get('SKIP_MIGRATIONS')) {
    const mikroOrm = app.get(MikroORM);
    await mikroOrm.getSchemaGenerator().ensureDatabase();
    await mikroOrm.migrator.up();
    await mikroOrm.seeder.seed(DefaultSeeder);
    Logger.log(await mikroOrm.getMigrator().getPendingMigrations());
  }

  app.use(cookieParser(config.getOrThrow(CONFIG_VARS.cookieSecret)));

  // app.use(csurf());

  app.use(helmet());

  app.setGlobalPrefix('/api');

  app.use(express.static(resolve(currentDir, '..', 'ui')));

  app.enableShutdownHooks();

  await app.listen(process.env.PORT || 5000, '0.0.0.0');
})();
