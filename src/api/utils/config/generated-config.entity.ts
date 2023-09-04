import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity()
export class GeneratedConfig {
  @PrimaryKey()
  id!: number;

  @Property()
  jwtSecret!: string;

  @Property()
  cookieSecret!: string;

  @Property()
  vapidPublic!: string;

  @Property()
  vapidPrivate!: string;

  @Property()
  envUrl!: string;

  @Property()
  envName!: string;

  @Property()
  emailHost!: string;

  @Property()
  emailPort!: string;

  @Property()
  emailUser!: string;

  @Property()
  emailPassword!: string;

  @Property()
  emailReplyTo!: string;
}
