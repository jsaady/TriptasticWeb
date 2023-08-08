import { Inject, Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import postgres, { Sql } from 'postgres';

export const PG_PROVIDER_NAME = 'PG';

export const PG_PROVIDER: Provider<Sql> = {
  provide: PG_PROVIDER_NAME,
  useFactory: (config: ConfigService) => {
    const url = new URL(config.getOrThrow('DATABASE_URL')!);

    return postgres({
      host: url.host,
      user: url.username,
      pass: url.password,
      port: +url.port,
      database: url.pathname.slice(1)
    })
  },
  inject: [ConfigService]
};

export const InjectPG = () => Inject(PG_PROVIDER_NAME);
