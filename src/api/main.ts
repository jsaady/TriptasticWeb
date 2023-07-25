import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import express from 'express';
import { resolve } from 'path';


const currentDir = resolve(new URL(import.meta.url).pathname, '..');

(async () => {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('/api');

  app.use(express.static(resolve(currentDir, '..', 'ui')));

  await app.listen(3000);
})();
