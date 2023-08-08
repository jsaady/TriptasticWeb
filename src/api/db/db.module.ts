import { DynamicModule, Module, Optional } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Sql } from 'postgres';
import { DBService } from './db.service.js';
import { InjectPG, PG_PROVIDER } from './pg.provider.js';

@Module({
  imports: [ConfigModule],
  providers: [DBService, PG_PROVIDER],
  exports: [PG_PROVIDER]
})
export class DBModule { }
