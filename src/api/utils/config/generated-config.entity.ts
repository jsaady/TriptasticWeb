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
}
