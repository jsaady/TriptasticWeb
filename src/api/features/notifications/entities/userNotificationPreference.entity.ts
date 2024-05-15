import { Collection, Entity, ManyToMany, OneToMany, OneToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { User } from '../../users/users.entity.js';
import { UserStopNotificationPreference } from './userStopNotificationPreference.entity.js';

@Entity()
export class UserNotificationPreference {

  @PrimaryKey({ autoincrement: true })
  id!: number;

  @OneToOne()
  user!: User;

  // @Property()
  // emailEnabled!: boolean;

  @Property()
  subscribeToAllStops!: boolean;

  @OneToMany(() => UserStopNotificationPreference, userStopNotificationPreference => userStopNotificationPreference.userNotificationPreference)
  userStopNotificationPreferences = new Collection<UserStopNotificationPreference>(this);
}
