import { wrap } from '@mikro-orm/core';
import { EntityManager } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { AuthService } from '../auth/auth.service.js';
import { Stop } from './entities/stop.entity.js';
import { Trip } from './entities/trip.entity.js';
import { User } from '../users/users.entity.js';

@Injectable()
export class StopsService {
  constructor(
    private em: EntityManager,
    private auth: AuthService,
  ) {}

  async create(stopDto: Pick<Stop, 'latitude'|'longitude'|'name'>): Promise<Stop> {
    const stop = wrap(new Stop()).assign(stopDto);
    stop.creator = this.em.getReference(User, this.auth.getCurrentUserId());
    stop.trip = this.em.getReference(Trip, 1);
    await this.em.persist(stop).flush();

    return stop;
  }

  async getStopsByTrip(tripId: number) {
    const stops = await this.em.find(Stop, { trip: this.em.getReference(Trip, tripId) });

    return stops;
  }
}
