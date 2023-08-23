import { Entity, Property } from '@mikro-orm/core';
import { BaseEntity } from '../../db/base.js';

@Entity()
export class User extends BaseEntity {
  @Property({ nullable: true })
  gitlabId?: string|number;

  @Property()
  email!: string;
  
  @Property()
  password!: string;

  @Property()
  isAdmin!: boolean;

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
}
