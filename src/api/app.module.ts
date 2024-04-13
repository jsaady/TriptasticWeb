import { MikroORM, RequestContext } from '@mikro-orm/core';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { ContextModule } from '@nestjs-enhanced/context';
import { QueueMiddlewareService, QueueModule } from '@nestjs-enhanced/pg-boss';
import { PubSubModule } from '@nestjs-enhanced/pub-sub';
import { SocketsModule } from '@nestjs-enhanced/sockets';
import { WorkersModule } from '@nestjs-enhanced/workers';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigService, ConfigModule as NestConfigModule, ConfigService as NestConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { resolve } from 'path';
import { MigrationModule } from './db/migration.provider.js';
import { AuthModule } from './features/auth/auth.module.js';
import { NotificationModule } from './features/notifications/notification.module.js';
import { UsersModule } from './features/users/users.module.js';
import { RATE_LIMIT_LIMIT, RATE_LIMIT_TTL } from './utils/config/config.js';
import { StopsModule } from './features/stops/stops.module.js';

const currentDir = resolve(new URL(import.meta.url).pathname, '..');

@Module({
  imports: [
    NestConfigModule.forRoot(),
    MigrationModule,
    WorkersModule,
    ServeStaticModule.forRoot({
      rootPath: resolve(currentDir, '..', 'ui')
    }),
    QueueModule.registerAsync({
      useFactory: (config) => ({
        connectionString: config.getOrThrow('DATABASE_URL'),
        password: config.getOrThrow('DATABASE_PASSWORD')
      }),
      inject: [ConfigService],
      imports: [NestConfigModule]
    }),
    PubSubModule.registerPostgresAsync({
      useFactory: (config) => ({
        connectionString: config.getOrThrow('DATABASE_URL'),
        password: config.getOrThrow('DATABASE_PASSWORD')
      }),
      inject: [ConfigService],
      imports: [NestConfigModule]
    }),
    SocketsModule,
    ContextModule,
    AuthModule,
    NotificationModule,
    StopsModule,
    UsersModule,
    ThrottlerModule.forRoot({
      ttl: RATE_LIMIT_TTL,
      limit: RATE_LIMIT_LIMIT
    }),
    MikroOrmModule.forRootAsync({
      useFactory: (config: NestConfigService) => {

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
})
export class AppModule implements NestModule {
  constructor (
    private queueMiddleware: QueueMiddlewareService,
    private mikroOrm: MikroORM
  ) { }

  configure(consumer: MiddlewareConsumer) {
    this.queueMiddleware.register((_, next) => {
      RequestContext.create(this.mikroOrm.em.fork(), () => next());
    });
  }
}
