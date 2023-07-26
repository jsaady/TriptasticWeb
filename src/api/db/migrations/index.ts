import { Sql } from 'postgres';
import initialMigration from './initial.migration.js';
interface Migration {
  name: string;
  up: (tx: Sql) => Promise<boolean>;
  down: (tx: Sql) => Promise<boolean>;
  check: (tx: Sql) => Promise<boolean>;
}

const migrations: Migration[] = [
  initialMigration
];

export default migrations;
