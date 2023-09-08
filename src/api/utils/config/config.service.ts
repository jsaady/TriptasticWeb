import { InjectEntityManager, InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager, EntityRepository } from '@mikro-orm/postgresql';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService as Config } from '@nestjs/config';
import webPush from 'web-push';
import { CONFIG_VARS } from './config.js';
import { GeneratedConfig } from './generated-config.entity.js';
import { GENERATED_CONFIG } from './generated-config.provider.js';

@Injectable()
export class ConfigService {

  constructor(
    @Inject(GENERATED_CONFIG) private generatedConfig: GeneratedConfig
  ) {}


  private checkInitialized () {
    if (!this.generatedConfig) {
      throw new Error('Config not initialized');
    }
  }

  get(key: keyof typeof CONFIG_VARS) {
    this.checkInitialized();

    return this.generatedConfig![key]!;
  }


  getOrThrow(key: keyof typeof CONFIG_VARS) {
    this.checkInitialized();

    if (!(key in this.generatedConfig!)) {
      throw new Error(`Config value ${key} not set`);
    }

    return this.get(key);
  }
}