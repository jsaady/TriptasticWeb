import type { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import { hash } from 'bcrypt';
import { AUTH_SALT_ROUNDS } from '../../features/auth/auth.constants.js';
import { User } from '../../features/users/users.entity.js';
import { Trip } from '../../features/stops/entities/trip.entity.js';

export class TripSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {

    const existingTripCount = await em.count(Trip);

    if (existingTripCount === 0) {
      console.log('Inserting new root trip');
      em.create(Trip, {
        createdAt: new Date(),
        updatedAt: new Date(),
        name: 'Root Trip',
        creator: em.getRepository(User).getReference(1),
      });
    }
  }
}
