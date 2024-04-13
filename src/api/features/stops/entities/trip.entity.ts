import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { User } from '../../users/users.entity.js';

@Entity()
export class Trip {
  constructor() {
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  @PrimaryKey({ autoincrement: true })
  id!: number;

  @Property()
  name!: string;

  @Property()
  createdAt: Date;

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date;

  @ManyToOne()
  creator!: User;
}
