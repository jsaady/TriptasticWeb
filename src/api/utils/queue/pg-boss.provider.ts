import { Inject, InjectionToken, Provider } from '@nestjs/common';
import PgBoss from 'pg-boss';
export type QueueModuleOptions = PgBoss.ConstructorOptions;

export const PG_BOSS_OPTIONS = 'PG_BOSS_OPTIONS';

export const PG_BOSS: InjectionToken<PgBoss> = 'PG_BOSS';

export const InjectPGBoss = () => Inject(PG_BOSS)

export const PgBossProvider: Provider = {
  provide: PG_BOSS,
  useFactory: (opts: QueueModuleOptions) => {
    return new PgBoss(opts);
  },
  inject: [PG_BOSS_OPTIONS]
}
