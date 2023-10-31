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

  get<K extends keyof typeof CONFIG_VARS>(key: K): typeof CONFIG_VARS[K]|void
  get<K extends keyof typeof CONFIG_VARS>(key: K, defaultValue: typeof CONFIG_VARS[K]): typeof CONFIG_VARS[K]
  get<K extends keyof typeof CONFIG_VARS>(key: K, defaultValue?: typeof CONFIG_VARS[K]) {
    this.checkInitialized();

    return this.generatedConfig![key]! ?? defaultValue;
  }


  getOrThrow(key: keyof typeof CONFIG_VARS) {
    this.checkInitialized();

    if (!(key in this.generatedConfig!)) {
      throw new Error(`Config value ${key} not set`);
    }

    return this.generatedConfig[key];
  }
}
