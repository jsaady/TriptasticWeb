import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import webPush from 'web-push';
import { IS_MIGRATED } from '../../db/migration.provider.js';
import { CONFIG_VARS, FullConfig } from './config.js';
import { GeneratedConfig } from './generated-config.entity.js';
@Injectable()
export class GeneratedConfigService {
  logger = new Logger('GeneratedConfigService');
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

  async fetchConfig(): Promise<FullConfig> {
    let existingConfig = await this.em.findOne(GeneratedConfig, { id: 1 });
    
    if (!existingConfig) {
      this.logger.log('Initializing config');
      const vapidCreds = webPush.generateVAPIDKeys();
      
      existingConfig = this.em.create(GeneratedConfig, {
        id: 1,
        jwtSecret: this.rand(16),
        cookieSecret: this.rand(16),
        vapidPublic: vapidCreds.publicKey,
        vapidPrivate: vapidCreds.privateKey
      });
      await this.em.persistAndFlush(existingConfig);
    } else {
      this.logger.log('Initializing config');
    }

    const config = Object.assign({}, existingConfig, {
      emailHost: this.config.getOrThrow(CONFIG_VARS.emailHost),
      emailPort: this.config.getOrThrow(CONFIG_VARS.emailPort),
      emailUser: this.config.getOrThrow(CONFIG_VARS.emailUser),
      emailPassword: this.config.getOrThrow(CONFIG_VARS.emailPassword),
      emailReplyTo: this.config.getOrThrow(CONFIG_VARS.emailReplyTo),
      envUrl: this.config.getOrThrow(CONFIG_VARS.envUrl),
      envName: this.config.getOrThrow(CONFIG_VARS.envName),
      ollamaUrl: this.config.get(CONFIG_VARS.ollamaUrl),
      ollamaChatModel: this.config.get(CONFIG_VARS.ollamaChatModel),
      ollamaEmbeddingModel: this.config.get(CONFIG_VARS.ollamaEmbeddingModel),
      openaiUrl: this.config.get(CONFIG_VARS.openaiUrl),
      openaiKey: this.config.get(CONFIG_VARS.openaiKey),
      openaiChatModel: this.config.get(CONFIG_VARS.openaiChatModel),
      openaiEmbeddingModel: this.config.get(CONFIG_VARS.openaiEmbeddingModel),
    });

    return config;
  }
}
