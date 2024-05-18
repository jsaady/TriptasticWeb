import { Entity, Enum, Property, Unique } from '@mikro-orm/core';
import { BaseEntity } from '../../db/base.js';
import { UserRole } from './userRole.enum.js';

@Entity()
export class User extends BaseEntity {
  @Property()
  @Unique()
  email!: string;

  @Property()
  @Unique()
  username!: string;
  
  @Property()
  password!: string;

  @Property()
  @Enum(() => UserRole)
  role!: UserRole;

  @Property()
  needPasswordReset!: boolean;

  @Property()
  emailConfirmed!: boolean;

  @Property({ nullable: true })
  emailToken?: string | null;

  @Property({ nullable: true, type: 'datetime' })
  emailTokenDate?: Date | null;

  @Property({ nullable: true, type: 'string' })
  currentWebAuthnChallenge?: string | null;

  @Property({ nullable: true, type: 'datetime' })
  lastLoginDate?: Date | null;
}
