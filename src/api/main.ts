import { NestFactory } from '@nestjs/core';
import express from 'express';
import { resolve } from 'path';
import { AppModule } from './app.module.js';


const currentDir = resolve(new URL(import.meta.url).pathname, '..');

(async () => {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('/api');

  app.use(express.static(resolve(currentDir, '..', 'ui')));

  app.enableShutdownHooks();

  await app.listen(process.env.PORT || 5000);
})();
