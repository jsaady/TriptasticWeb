import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GENERATED_CONFIG_PROVIDER } from './generated-config.provider.js';
import { GeneratedConfigService } from './generated-config.service.js';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { GeneratedConfig } from './generated-config.entity.js';
import { MigrationModule } from '../../db/migration.provider.js';

@Module({
  imports: [MigrationModule, ConfigModule, MikroOrmModule.forFeature([GeneratedConfig])],
  providers: [GeneratedConfigService, GENERATED_CONFIG_PROVIDER],
  exports: [GENERATED_CONFIG_PROVIDER]
})
export class GeneratedConfigModule {}
