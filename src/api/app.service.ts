import { Injectable } from '@nestjs/common';
import { InjectPG } from './db/pg.provider.js';
import { Sql } from 'postgres';

@Injectable()
export class AppService {
  constructor (
    @InjectPG() pg: Sql
  ) { }
}
