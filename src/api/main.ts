import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module.js';
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
