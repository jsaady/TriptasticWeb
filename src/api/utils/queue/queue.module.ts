import { DynamicModule, Inject, Logger, Module, NestModule } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import PgBoss from 'pg-boss';
import { UnwrapForRootArgs } from '../unwrap-args.js';
import { InternalQueueMiddlewareService } from './internal-queue-middleware.service.js';
import { PG_BOSS, PG_BOSS_OPTIONS, PgBossProvider, QueueModuleOptions } from './pg-boss.provider.js';
import { QueueMiddlewareService } from './queue-middleware.service.js';
import { QueueExplorer } from './queue.explorer.js';


@Module({})
export class QueueModule implements NestModule {
  static register(pgBossOptions: QueueModuleOptions): DynamicModule {
    return this.registerAsync({ useFactory: () => pgBossOptions });
  }

  static registerAsync<A extends any[]>(opts: {
    useFactory: (...args: A) => QueueModuleOptions | Promise<QueueModuleOptions>,
    inject?: UnwrapForRootArgs<A>,
    imports?: DynamicModule['imports'],
  }): DynamicModule {
    return {
      global: true,
      module: QueueModule,
      imports: [DiscoveryModule, ...(opts.imports ?? [])],
      providers: [
        {
          provide: PG_BOSS_OPTIONS,
          useFactory: opts.useFactory,
          inject: opts.inject
        },
        PgBossProvider,
        QueueMiddlewareService,
        InternalQueueMiddlewareService,
        QueueExplorer
      ],
      exports: [
        PgBossProvider,
        QueueMiddlewareService
      ]
    }
  }

  logger = new Logger('QueueModule');

  constructor (
    @Inject(PG_BOSS) private pgBoss: PgBoss,
    private explorer: QueueExplorer
  ) { }

  async configure() {
    await this.pgBoss.start();

    this.pgBoss.on('error', (e) => {
      this.logger.error(e);
    });

    await this.explorer.explore();
  }
}
