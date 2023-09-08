import { Inject, Injectable } from '@nestjs/common';
import { GeneratedConfig } from './generated-config.entity.js';
import { EntityRepository } from '@mikro-orm/postgresql';
import webPush from 'web-push';
import { ConfigService } from '@nestjs/config';
import { CONFIG_VARS } from './config.js';
import { InjectRepository } from '@mikro-orm/nestjs';
import { IS_MIGRATED } from '../../db/migration.provider.js';
@Injectable()
export class GeneratedConfigService {

  constructor(
    private config: ConfigService,
    @Inject(IS_MIGRATED) isMigrated: boolean,
    @InjectRepository(GeneratedConfig) private repo: EntityRepository<GeneratedConfig>,
  ) {}

  private get em() {
    return this.repo.getEntityManager().fork();
  }

  private rand (size: number) {
    return [...Array(size)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
  }

  async fetchConfig() {
    console.log('Initializing config');
    let existingConfig = await this.em.findOne(GeneratedConfig, { id: 1 });

    if (!existingConfig) {
      const vapidCreds = webPush.generateVAPIDKeys();
      
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

    return existingConfig;
  }
}