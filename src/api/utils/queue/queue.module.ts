import { MikroORM, RequestContext } from '@mikro-orm/core';
import { DynamicModule, Inject, InjectionToken, Module, NestModule, Optional, Provider } from '@nestjs/common';
import { DiscoveryModule, DiscoveryService, ModuleRef } from '@nestjs/core';
import PgBoss from 'pg-boss';
import { QueueHandlerType, queueMetadataStore } from './queue.decorator.js';

export const PG_BOSS_OPTIONS = 'PG_BOSS_OPTIONS';

export const PG_BOSS: InjectionToken<PgBoss> = 'PG_BOSS';

export const InjectPGBoss = () => Inject(PG_BOSS)

const PgBossProvider: Provider = {
  provide: PG_BOSS,
  useFactory: (opts: PgBoss.ConstructorOptions) => {
    return new PgBoss(opts);
  },
  inject: [PG_BOSS_OPTIONS]
}

export type UnwrapArgs<A extends any[]> = {
  [P in keyof A]: InjectionToken<A[P]>
};

@Module({})
export class QueueModule implements NestModule {
  static forRoot(pgBossOptions: PgBoss.ConstructorOptions): DynamicModule {
    return this.forRootAsync({ useFactory: () => pgBossOptions });
  }

  static forRootAsync<A extends any[]>(opts: {
    useFactory: (...args: A) => PgBoss.ConstructorOptions | Promise<PgBoss.ConstructorOptions>,
    inject?: UnwrapArgs<A>,
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
      ],
      exports: [
        PgBossProvider
      ]
    }
  }

  constructor (
    @Inject(PG_BOSS)
    private pgBoss: PgBoss,
    private readonly moduleRef: ModuleRef,
    @Optional() private mikroOrm: MikroORM,
    private readonly discoveryService: DiscoveryService
  ) { }

  async configure() {
    await this.pgBoss.start();

    this.pgBoss.on('error', (e) => {
      console.log(e);
    });

    for(const [queueName, value] of queueMetadataStore) {
      const providerMap = new Map(this.discoveryService.getProviders().filter(({ token }) => value.some(({ provider }) => provider === token)).map(({ instance, token }) => [token, instance]));

      for (const queue of value) {
        const { key, provider } = queue;
        const instance = providerMap.get(provider);
        this.pgBoss.work(queueName, async (job) => {
          return new Promise<void>((resolve, reject) => {
            RequestContext.create(this.mikroOrm.em, async () => {
              try {
                await instance[key].bind(instance)(job);
                resolve();
              } catch(e) {
                reject(e);
              }
            });
          });
        });

        if (queue.handlerType === QueueHandlerType.schedule) {
          await this.pgBoss.schedule(queueName, queue.schedule);
        }
      }
    }
  }
}
