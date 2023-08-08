import { Sql } from 'postgres';

export const checkTableExists = async (sql: Sql, tableName: string) => {
  const [{exists}] = await sql`
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_name = ${tableName}
    );
  `;

  return exists;
}