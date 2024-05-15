import { Entity, ManyToOne, OneToMany, PrimaryKey, Property } from '@mikro-orm/core';
import { User } from '../../users/users.entity.js';

@Entity()
export class Subscription {
  @PrimaryKey()
  id!: number;

  @ManyToOne()
  user!: User;

  @Property()
  endpoint!: string;

  @Property({ type: 'json' })
  keys!: {
    p256dh: string;
    auth: string;
  };
}
