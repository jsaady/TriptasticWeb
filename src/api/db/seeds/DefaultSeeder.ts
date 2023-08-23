import type { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import { AdminSeeder } from './AdminSeeder.js';

export class DefaultSeeder extends Seeder {
  async run (em: EntityManager) {
    await this.call(em, [AdminSeeder])
  }
}
