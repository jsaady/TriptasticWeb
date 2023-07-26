import { DynamicModule, Module, Optional } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Sql } from 'postgres';
import { DBService } from './db.service.js';
import { InjectPG, PG_PROVIDER } from './pg.provider.js';

@Module({
  imports: [ConfigModule],
  providers: [DBService]
})
export class DBModule {
  constructor (
    @Optional() @InjectPG() pg: Sql
  ) {
    if (!pg) throw new ReferenceError('forRoot not called')
  }

  static forRoot(): DynamicModule {
    return {
      module: DBModule,
      providers: [PG_PROVIDER, DBService],
      exports: [PG_PROVIDER]
    };
  }
}