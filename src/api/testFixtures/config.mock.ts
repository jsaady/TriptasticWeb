import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule, ConfigService as NestConfigService } from '@nestjs/config';
import { ConfigService } from '../utils/config/config.service.js';

export const configOverride = { provide: ConfigService, useClass: NestConfigService };

@Module({
  imports: [
    NestConfigModule.forRoot({
      envFilePath: '.env.test',
    })
  ],
  providers: [
    configOverride
  ],
  exports: [configOverride]
})
export class MockConfigModule { }

