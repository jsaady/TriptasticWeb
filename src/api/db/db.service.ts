import { Injectable } from '@nestjs/common';
import { Sql } from 'postgres';
import migrations from './migrations/index.js';
import { InjectPG } from './pg.provider.js';

interface MigrationHistory {
  name: string;
  success: boolean;
  date: number;
}

@Injectable()
export class DBService {
  constructor (
    @InjectPG() private pg: Sql
  ) { }

  async createMigrationTable () {
    const [{exists}] = await this.pg`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE  table_name   = 'migrations'
      );
    `;

    if (!exists) {
      await this.pg`
        CREATE TABLE migrations (
          ID serial PRIMARY KEY     NOT NULL,
          NAME           TEXT    NOT NULL,
          SUCCESS        boolean NOT NULL,
          DATE           timestamp
       );
      `;
    }
  }

  async getAllExistingMigrations(): Promise<MigrationHistory[]> {
    return this.pg`
      SELECT * FROM migrations
    `;
  }

  async up() {
    await this.createMigrationTable();
    const existingMigrations = await this.getAllExistingMigrations();
    const existingMigrationsMap = existingMigrations.reduce((acc, m) => {
      acc.set(m.name, m.success);

      return acc;
    }, new Map<string, boolean>())
    for (const migration of migrations) {
      const newMigrationHistory: MigrationHistory = {
        name: migration.name,
        success: false,
        date: Date.now()
      };
      try {
        if (existingMigrationsMap.has(migration.name)) {
          const wasSuccessful = existingMigrationsMap.get(migration.name);
          
          if (!wasSuccessful) {
            throw new Error(`Fix ${migration.name} manually`);
          }
          
          continue;
        }
        await this.pg.begin(async (tx) => {
          const shouldRun = await migration.check?.(tx) ?? true;

          if (shouldRun) {
            const successful = await migration.up(tx);

            if (!successful) {
              throw new Error(`${migration.name} returned false`);
            }

            newMigrationHistory.success = true;
          }
        });
      } catch (e) {
        console.error(e);
      }

      await this.pg`
        insert into migrations
        ${this.pg(newMigrationHistory, 'name', 'success', 'date')}
      `
    }
  }
}