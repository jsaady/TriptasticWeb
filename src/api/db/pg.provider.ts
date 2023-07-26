import { Inject, Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import postgres, { Sql } from 'postgres';

const PG = 'PG';

export const PG_PROVIDER: Provider<Sql> = {
  provide: PG,
  useFactory: (config: ConfigService) => {
    const url = new URL(config.get('DATABASE_URL')!);

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

export const InjectPG = () => Inject(PG);
