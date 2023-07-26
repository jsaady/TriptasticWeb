import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { ConfigModule } from '@nestjs/config';
import { DBModule } from './db/db.module.js';

@Module({
  imports: [ConfigModule.forRoot(), DBModule.forRoot()],
  controllers: [AppController]
})
export class AppModule { }
