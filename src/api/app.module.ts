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
import { NotificationModule } from './features/notifications/notification.module.js';
import { ServeStaticModule } from '@nestjs/serve-static';
import { resolve } from 'path';

const currentDir = resolve(new URL(import.meta.url).pathname, '..');


@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: resolve(currentDir, '..', 'ui')
    }),
    ContextModule,
    AuthModule,
    NotificationModule,
    UsersModule,
    ConfigModule.forRoot(),
    ThrottlerModule.forRoot({
      ttl: RATE_LIMIT_TTL,
      limit: RATE_LIMIT_LIMIT
    }),
    MikroOrmModule.forRootAsync({
      useFactory: (config: ConfigService) => {
        // let url = config.get('DATABASE_URL')!;

        // if (!url) {
        //   url = `${}`
        // }

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
          seeder: {
            defaultSeeder: 'DefaultSeeder',
            path: './dist/api/db/seeds',
            pathTs: './src/api/db/seeds',
            glob: '!(*.d).{js,ts}'
          }
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
