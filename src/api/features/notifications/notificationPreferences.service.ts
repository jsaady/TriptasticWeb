import { EntityManager, wrap } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';
import { Stop } from '../stops/entities/stop.entity.js';
import { User } from '../users/users.entity.js';
import { UserNotificationPreference } from './entities/userNotificationPreference.entity.js';
import { UserStopNotificationPreference } from './entities/userStopNotificationPreference.entity.js';

@Injectable()
export class NotificationPreferencesService {
  constructor(
    private em: EntityManager
  ) {}

  async subscribeToStopNotifications(userId: number, stopId: number): Promise<void> {
    const userRef = this.em.getReference(User, userId);
    let preference = await this.em.findOne(UserNotificationPreference, { user: userRef }, { populate: ['user', 'subscribeToAllStops', 'userStopNotificationPreferences'] }) as UserNotificationPreference;

    if (!preference) {
      preference = wrap(new UserNotificationPreference()).assign({ user: userRef }) as UserNotificationPreference;
      preference.subscribeToAllStops = false;
      this.em.persist(preference);
    }

    const stopPreference = preference.userStopNotificationPreferences.getItems().find(p => p.stop.id === stopId);

    if (stopPreference) {
      return;
    }

    const stop = this.em.getReference(Stop, stopId);

    const newStopPreference = wrap(new UserStopNotificationPreference())
      .assign({ userNotificationPreference: preference, stop });

    preference.userStopNotificationPreferences.add(newStopPreference);
    
    this.em.persist(newStopPreference);

    await this.em.flush();
  }

  async subscribeToAllNotifications(userId: number): Promise<void> {
    const userRef = this.em.getReference(User, userId);
    let preference = await this.em.findOne(UserNotificationPreference, { user: userRef }, { populate: ['user', 'subscribeToAllStops', 'userStopNotificationPreferences'] }) as UserNotificationPreference;

    if (!preference) {
      preference = wrap(new UserNotificationPreference()).assign({ user: userRef }) as UserNotificationPreference;
      this.em.persist(preference);
    }
    
    preference.subscribeToAllStops = true;

    await this.em.flush();
  }

  async unsubscribeFromStopNotifications(userId: number, stopId: number): Promise<void> {
    const userRef = this.em.getReference(User, userId);
    let preference = await this.em.findOne(UserNotificationPreference, { user: userRef }, { populate: ['user', 'subscribeToAllStops', 'userStopNotificationPreferences'] }) as UserNotificationPreference;

    if (!preference) {
      return;
    }

    const stopPreference = preference.userStopNotificationPreferences.getItems().find(p => p.stop.id === stopId);

    if (!stopPreference) {
      return;
    }

    preference.userStopNotificationPreferences.remove(stopPreference);

    this.em.remove(stopPreference);

    await this.em.flush();
  }

  async unsubscribeFromAllNotifications(userId: number): Promise<void> {
    const userRef = this.em.getReference(User, userId);
    let preference = await this.em.findOne(UserNotificationPreference, { user: userRef }, { populate: ['user', 'subscribeToAllStops', 'userStopNotificationPreferences'] }) as UserNotificationPreference;

    if (!preference) {
      return;
    }

    // Remove all stop preferences
    for (const stopPreference of preference.userStopNotificationPreferences.getItems()) {
      preference.userStopNotificationPreferences.remove(stopPreference);
      this.em.remove(stopPreference);
    }

    preference.subscribeToAllStops = false;

    await this.em.flush();
  }

  async getUserIdsToNotify(stopId: number): Promise<number[]> {
    const userIds = new Set<number>();

    const stopRef = this.em.getReference(Stop, stopId);
    const preferences = await this.em.find(UserStopNotificationPreference, { stop: stopRef }, { populate: ['userNotificationPreference.user'] });

    for (const preference of preferences) {
      userIds.add(preference.userNotificationPreference.user.id);
    }

    const preferencesWithAllStops = await this.em.find(UserNotificationPreference, { subscribeToAllStops: true }, { populate: ['user'] });

    for (const preference of preferencesWithAllStops) {
      userIds.add(preference.user.id);
    }
    
    return [...userIds];
  }

  async getUserNotificationPreferences(userId: number): Promise<UserNotificationPreference> {
    const userRef = this.em.getReference(User, userId);
    let preferences = await this.em.findOne(UserNotificationPreference, { user: userRef }, { populate: ['subscribeToAllStops', 'userStopNotificationPreferences'] }) as UserNotificationPreference;

    if (!preferences) {
      preferences = wrap(new UserNotificationPreference()).assign({ user: userRef }) as UserNotificationPreference;
      preferences.subscribeToAllStops = false;
      this.em.persist(preferences);
      await this.em.flush();
    }

    return preferences;
  }
}