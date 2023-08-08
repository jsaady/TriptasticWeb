import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller.js';
import { AuthModule } from './auth/auth.module.js';
import { ContextModule } from './context/context.module.js';
import { UsersModule } from './users/users.module.js';

@Module({
  imports: [
    ContextModule,
    AuthModule,
    UsersModule,
    ConfigModule.forRoot()
  ],
  controllers: [AppController]
})
export class AppModule { }
