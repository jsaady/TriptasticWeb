import { EntityManager } from '@mikro-orm/postgresql';
import { Seeder } from '@mikro-orm/seeder';
import { User } from '../../features/users/users.entity.js';
import { UserRole } from '../../features/users/userRole.enum.js';

export class TestSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    const existingUserCount = await em.count(User);

    if (existingUserCount <= 1) {
      console.log('Inserting test users');

      em.create(User, {
        email: 'test2@test.com',
        username: 'test2',
        password: 'test2',
        emailConfirmed: true,
        needPasswordReset: true,
        role: UserRole.USER,
      });

      em.create(User, {
        email: 'test3@test.com',
        username: 'test3',
        password: 'test3',
        emailConfirmed: true,
        needPasswordReset: true,
        role: UserRole.USER,
      });
    }
  }
}
