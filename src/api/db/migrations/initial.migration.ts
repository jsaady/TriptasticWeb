import { Sql } from 'postgres';

export default {
  name: 'INITIAL',
  check: async (sql: Sql) => {
    return true;
  },
  up: async (sql: Sql) => {
    const result = await sql`
      SELECT 1
    `;

    return !!result;
  },
  down: async (sql: Sql) => {
    return true;
  }
}