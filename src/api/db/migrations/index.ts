import { Sql } from 'postgres';
import initialMigration from './initial.migration.js';
import userMigration from './user.migration.js';
import userSeed from './user.seed.js';
interface Migration {
  name: string;
  up: (tx: Sql) => Promise<boolean>;
  down: (tx: Sql) => Promise<boolean>;
  check: (tx: Sql) => Promise<boolean>;
}

const migrations: Migration[] = [
  initialMigration,
  userMigration,
  userSeed
];

export default migrations;
