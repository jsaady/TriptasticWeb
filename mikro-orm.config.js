/**
 * @type {import('@mikro-orm/core').Options}
 */
export default {
  type: 'postgresql',
  clientUrl: process.env.DATABASE_URL,
  entities: ['./dist/api/**/*.entity.js'],
  entitiesTs: ['./src/api/**/*.entity.ts'],
  migrations: {
    disableForeignKeys: false,
    path: './src/api/db/migrations'
  },
  seeder: {
    path: './src/api/db/seeds',
    defaultSeeder: 'DefaultSeeder',
    glob: '!(*.d).{js,ts}'
  }
}