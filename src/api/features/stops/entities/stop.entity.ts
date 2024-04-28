import { Cascade, Collection, Entity, ManyToOne, OneToMany, PrimaryKey, Property } from '@mikro-orm/core';
import { User } from '../../users/users.entity.js';
import { Attachment } from './attachment.entity.js';
import { Trip } from './trip.entity.js';

@Entity()
export class Stop {
  constructor() {
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  @PrimaryKey({ autoincrement: true })
  id!: number;

  @Property()
  name!: string;

  @Property({ nullable: true, type: 'text' })
  notes?: string;

  @Property()
  createdAt: Date;

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date;

  @Property({ type: 'double precision' })
  latitude!: number;

  @Property({ type: 'double precision' })
  longitude!: number;
  
  @ManyToOne()
  creator!: User;

  @ManyToOne()
  trip!: Trip;

  @OneToMany(() => Attachment, attachment => attachment.stop, { cascade: [Cascade.REMOVE] })
  attachments = new Collection<Attachment>(this);
}