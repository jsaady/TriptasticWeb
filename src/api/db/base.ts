import { PrimaryKey, Property, SerializedPrimaryKey } from '@mikro-orm/core';

export class BaseEntity {
  @PrimaryKey({ autoincrement: true })
  id!: number;

  @Property()
  createdAt?: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt?: Date = new Date();
}