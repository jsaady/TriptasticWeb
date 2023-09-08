import { MikroOrmModule } from '@mikro-orm/nestjs';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule as NestConfigModule, ConfigService as NestConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { resolve } from 'path';
import { AppController } from './app.controller.js';
import { MigrationModule } from './db/migration.provider.js';
import { AuthModule } from './features/auth/auth.module.js';
import { NotificationModule } from './features/notifications/notification.module.js';
import { UsersModule } from './features/users/users.module.js';
import { RATE_LIMIT_LIMIT, RATE_LIMIT_TTL } from './utils/config/config.js';
import { ContextModule } from './utils/context/context.module.js';

const currentDir = resolve(new URL(import.meta.url).pathname, '..');


@Module({
  imports: [
    NestConfigModule.forRoot(),
    MigrationModule,
    ServeStaticModule.forRoot({
      rootPath: resolve(currentDir, '..', 'ui')
    }),
    ContextModule,
    AuthModule,
    NotificationModule,
    UsersModule,
    ThrottlerModule.forRoot({
      ttl: RATE_LIMIT_TTL,
      limit: RATE_LIMIT_LIMIT
    }),
    MikroOrmModule.forRootAsync({
      useFactory: (config: NestConfigService) => {
        // let url = config.get('DATABASE_URL')!;

        // if (!url) {
        //   url = `${}`
        // }

        const url = config.getOrThrow('DATABASE_URL')!;

        return {
          type: 'postgresql',
          clientUrl: url,
          password: config.getOrThrow('DATABASE_PASSWORD'),
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
      inject: [NestConfigService],
      imports: [NestConfigModule]
    })
  ],
  providers: [{
    provide: APP_GUARD,
    useClass: ThrottlerGuard
  }],
  controllers: [AppController]
})
export class AppModule implements NestModule {
  async configure(consumer: MiddlewareConsumer) {
    console.log('here');
  }
}
