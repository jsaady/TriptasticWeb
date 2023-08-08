import { Sql } from 'postgres';
import { checkTableExists } from './helpers.js';

export default {
  name: 'USER_TABLE',
  check: async (sql: Sql) => {
    const exists = await checkTableExists(sql, 'users');
    return !exists;
  },
  up: async (sql: Sql) => {
    const result = await sql`
      CREATE TABLE users (
          id SERIAL PRIMARY KEY,
          gitlabId int UNIQUE,
          username varchar NOT NULL UNIQUE,
          email varchar NOT NULL UNIQUE,
          emailConfirmed bool NOT NULL DEFAULT false,
          password varchar NOT NULL,
          needPasswordReset bool NOT NULL DEFAULT false,
          isAdmin bool NOT NULL DEFAULT false
      );
    `;

    return !!result;
  },
  down: async (sql: Sql) => {
    await sql`
      DROP TABLE users
    `;

    return true;
  }
}