import type { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import { hash } from 'bcrypt';
import { AUTH_SALT_ROUNDS } from '../../features/auth/auth.constants.js';
import { User } from '../../features/users/users.entity.js';
import { UserRole } from '../../features/users/userRole.enum.js';

export const rootAdminEmail = 'admin@holyham.cloud';
export class AdminSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {

    const existingUserCount = await em.count(User);

    if (existingUserCount === 0) {
      console.log('Inserting new root user');
      em.create(User, {
        email: rootAdminEmail,
        username: 'admin',
        password: await hash('Password123!', AUTH_SALT_ROUNDS),
        needPasswordReset: true,
        emailConfirmed: true,
        role: UserRole.ADMIN,
      });
    }
  }
}
