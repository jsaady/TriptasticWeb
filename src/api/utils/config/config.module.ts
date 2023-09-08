import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { ConfigService } from './config.service.js';
import { GeneratedConfig } from './generated-config.entity.js';
import { GeneratedConfigModule } from './generated-config.module.js';

@Module({
  imports: [GeneratedConfigModule, MikroOrmModule.forFeature([GeneratedConfig])],
  providers: [ConfigService],
  exports: [ConfigService]
})
export class ConfigModule { }
