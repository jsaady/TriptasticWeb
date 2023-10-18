import { MikroORM } from '@mikro-orm/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DefaultSeeder } from './seeds/DefaultSeeder.js';
import { Module } from '@nestjs/common';

export const IS_MIGRATED = 'IS_MIGRATED';

export const MIGRATION_PROVIDER = {
  provide: IS_MIGRATED,
  useFactory: async (mikroOrm: MikroORM, config: ConfigService) => {
    if (!config.get('SKIP_MIGRATIONS')) {
      await mikroOrm.getSchemaGenerator().ensureDatabase();
      await mikroOrm.migrator.up();
      await mikroOrm.seeder.seed(DefaultSeeder);
    }

    return true;
  },
  inject: [MikroORM, ConfigService]
};

@Module({
  imports: [ConfigModule],
  providers: [MIGRATION_PROVIDER],
  exports: [MIGRATION_PROVIDER]
})
export class MigrationModule { }
