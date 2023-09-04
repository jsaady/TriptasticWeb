import { InjectEntityManager } from '@mikro-orm/nestjs';
import { EntityManager } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { ConfigService as Config } from '@nestjs/config';
import { generateVAPIDKeys } from 'web-push';
import { CONFIG_VARS } from './config.js';
import { GeneratedConfig } from './generated-config.entity.js';

@Injectable()
export class ConfigService {
  private generatedConfig?: GeneratedConfig;

  constructor(
    private readonly config: Config,
    @InjectEntityManager('default') private em: EntityManager,
  ) {}

  private rand (size: number) {
    return [...Array(size)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
  }

  private checkInitialized () {
    if (!this.generatedConfig) {
      throw new Error('Config not initialized');
    }
  }

  async init() {
    let existingConfig = await this.em.findOne(GeneratedConfig, {});

    if (!existingConfig) {
      const vapidCreds = generateVAPIDKeys();
      
      existingConfig = this.em.create(GeneratedConfig, {
        jwtSecret: this.rand(16),
        cookieSecret: this.rand(16),
        vapidPublic: vapidCreds.publicKey,
        vapidPrivate: vapidCreds.privateKey,
        emailHost: this.config.getOrThrow(CONFIG_VARS.emailHost),
        emailPort: this.config.getOrThrow(CONFIG_VARS.emailPort),
        emailUser: this.config.getOrThrow(CONFIG_VARS.emailUser),
        emailPassword: this.config.getOrThrow(CONFIG_VARS.emailPassword),
        emailReplyTo: this.config.getOrThrow(CONFIG_VARS.emailReplyTo),
        envUrl: this.config.getOrThrow(CONFIG_VARS.envUrl),
        envName: this.config.getOrThrow(CONFIG_VARS.envName),
      });
    } else {
      Object.assign(existingConfig, {
        emailHost: this.config.getOrThrow(CONFIG_VARS.emailHost),
        emailPort: this.config.getOrThrow(CONFIG_VARS.emailPort),
        emailUser: this.config.getOrThrow(CONFIG_VARS.emailUser),
        emailPassword: this.config.getOrThrow(CONFIG_VARS.emailPassword),
        emailReplyTo: this.config.getOrThrow(CONFIG_VARS.emailReplyTo),
        envUrl: this.config.getOrThrow(CONFIG_VARS.envUrl),
        envName: this.config.getOrThrow(CONFIG_VARS.envName),
      });
    }
    await this.em.flush();
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