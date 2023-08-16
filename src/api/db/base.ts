import { PrimaryKey, Property, SerializedPrimaryKey } from '@mikro-orm/core';

export class BaseEntity {
  @PrimaryKey()
  id!: number;

  @Property()
  createdAt = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}