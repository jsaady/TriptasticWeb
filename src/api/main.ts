import './instrumentation.js';

import { initSocketAdapters } from '@nestjs-enhanced/sockets';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { NextFunction } from 'express';
import helmet from 'helmet';
import { WinstonModule } from 'nest-winston';
import { Socket } from 'socket.io';
import winston from 'winston';
import { AppModule } from './app.module.js';
import { AuthService } from './features/auth/auth.service.js';
import { start } from './instrumentation.js';
import { ConfigService } from './utils/config/config.service.js';


(async () => {
  start();

  const app = await NestFactory.create(AppModule, {
    logger: process.env.NODE_ENV === 'development' ? undefined : WinstonModule.createLogger({
      format: winston.format.json(),
      transports: [new winston.transports.Console()],
    })
  });
  process.on('uncaughtException', (exc) => {
    console.error('Uncaught exception', exc);
  });

  process.on('unhandledRejection', (exc) => {
    console.error('Unhandled rejection', exc);
  });
  const config = app.get(ConfigService);

  const cookieParserMiddleware = cookieParser(config.getOrThrow('cookieSecret'));
  app.use(cookieParserMiddleware);

  // app.use(csurf());

  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        "default-src": ["'self'", "data:", "blob:", "https://*.tile.openstreetmap.org", "https://*.openstreetmap.org", "https://tiles.stadiamaps.com"],
        "img-src": ["'self'", "data:", "blob:", "https://*.tile.openstreetmap.org"],
        "script-src": ["'self'", "blob:"],
      },
    }
  }));

  app.setGlobalPrefix('/api');

  app.enableShutdownHooks();

  const authService = app.get(AuthService);

  const socketCookieParser = (socket: Socket, next: NextFunction) => {
    cookieParserMiddleware(socket.request as any, {} as any, next);
  };

  initSocketAdapters(app, (req) => authService.extractUserIdFromRequest(req), socketCookieParser);

  await app.listen(process.env.PORT || 3000, '0.0.0.0');
})();
