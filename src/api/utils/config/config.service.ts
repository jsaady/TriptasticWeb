import { Inject, Injectable } from '@nestjs/common';
import { CONFIG_VARS, FullConfig } from './config.js';
import { GENERATED_CONFIG } from './generated-config.provider.js';

@Injectable()
export class ConfigService {

  constructor(
    @Inject(GENERATED_CONFIG) private generatedConfig: FullConfig
  ) {}


  private checkInitialized () {
    if (!this.generatedConfig) {
      throw new Error('Config not initialized');
    }
  }

  get<K extends keyof typeof CONFIG_VARS>(key: K): FullConfig[K]|void
  get<K extends keyof typeof CONFIG_VARS>(key: K, defaultValue: FullConfig[K]): FullConfig[K]
  get<K extends keyof typeof CONFIG_VARS>(key: K, defaultValue?: FullConfig[K]) {
    this.checkInitialized();

    return this.generatedConfig![key]! ?? defaultValue;
  }


  getOrThrow<K extends keyof typeof CONFIG_VARS>(key: K): FullConfig[K] {
    this.checkInitialized();

    if (!(key in this.generatedConfig!)) {
      throw new Error(`Config value ${key} not set`);
    }

    return this.generatedConfig[key];
  }
}
