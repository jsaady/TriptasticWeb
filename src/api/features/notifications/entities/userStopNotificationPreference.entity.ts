import { Cascade, Entity, ManyToOne, PrimaryKey, Rel } from '@mikro-orm/core';
import { UserNotificationPreference } from './userNotificationPreference.entity.js';
import { Stop } from '../../stops/entities/stop.entity.js';

@Entity()
export class UserStopNotificationPreference {
  // @OneToOne()
  // user!: User;

  // @Property()
  // stopId!: string;

  // @Property()
  // emailEnabled!: boolean;

  // @Property()
  // pushEnabled!: boolean;

  @PrimaryKey({ autoincrement: true })
  id!: number;

  @ManyToOne(() => Stop, { cascade: [Cascade.REMOVE] })
  stop!: Rel<Stop>;

  @ManyToOne(() => UserNotificationPreference, { cascade: [Cascade.REMOVE] })
  userNotificationPreference!: Rel<UserNotificationPreference>;
}
