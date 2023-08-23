import type { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import { User } from '../../features/users/users.entity.js';
import { hash } from 'bcrypt';
import { AUTH_SALT_ROUNDS } from '../../features/auth/auth.constants.js';

export class AdminSeeder extends Seeder {

  async run(em: EntityManager): Promise<void> {
    const existingUserCount = await em.count(User);

    if (existingUserCount === 0) {
      const user = em.create(User, {
        email: 'admin@holyham.cloud',
        password: await hash('Password123!', AUTH_SALT_ROUNDS),
        needPasswordReset: true,
        emailConfirmed: true,
        isAdmin: true
      });
      await em.insert(User, user);
    }
  }
}
