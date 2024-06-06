import { Entity, ManyToOne, PrimaryKey, PrimaryKeyType, Property } from '@mikro-orm/core';
import { v4 } from 'uuid';
import { Ref } from 'react';
import { User } from '../../users/users.entity.js';

@Entity()
export class UserInvitation {
  @PrimaryKey({ autoincrement: true })
  id!: number;

  @Property()
  inviteCode = v4();

  @ManyToOne(() => User)
  inviter!: Ref<User>;
}