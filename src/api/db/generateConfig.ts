import { Options } from '@mikro-orm/postgresql';

export const generateConfig = (url: string, password: string): Options => {
  return {
    type: 'postgresql',
    name: 'default',
    clientUrl: url,
    password: password,
    entities: ['./**/*.entity.js'],
    entitiesTs: ['./**/*.entity.ts'],
    debug: true,
    migrations: {
      disableForeignKeys: false,
      path: './dist/api/db/migrations',
      pathTs: './src/api/db/migrations'
    },
    seeder: {
      defaultSeeder: 'DefaultSeeder',
      path: './dist/api/db/seeds',
      pathTs: './src/api/db/seeds',
      glob: '!(*.d).{js,ts}'
    }
  };
};
