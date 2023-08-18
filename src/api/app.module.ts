import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller.js';
import { ContextModule } from './utils/context/context.module.js';
import { UsersModule } from './features/users/users.module.js';
import { AuthModule } from './features/auth/auth.module.js';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { RATE_LIMIT_LIMIT, RATE_LIMIT_TTL } from './utils/config.js';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    ContextModule,
    AuthModule,
    UsersModule,
    ConfigModule.forRoot(),
    ThrottlerModule.forRoot({
      ttl: RATE_LIMIT_TTL,
      limit: RATE_LIMIT_LIMIT
    }),
    MikroOrmModule.forRootAsync({
      useFactory: (config: ConfigService) => {
        const url = config.getOrThrow('DATABASE_URL')!;

        return {
          type: 'postgresql',
          clientUrl: url,
          entities: ['./**/*.entity.js'],
          entitiesTs: ['./**/*.entity.ts'],
          migrations: {
            disableForeignKeys: false,
            path: './dist/api/db/migrations',
            pathTs: './src/api/db/migrations'
          },
        };
      },
      inject: [ConfigService],
      imports: [ConfigModule]
    })
  ],
  providers: [{
    provide: APP_GUARD,
    useClass: ThrottlerGuard
  }],
  controllers: [AppController]
})
export class AppModule { }
