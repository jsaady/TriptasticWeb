import { Cascade, Collection, Entity, Enum, Index, ManyToOne, OneToMany, PrimaryKey, Property } from '@mikro-orm/core';
import { User } from '../../users/users.entity.js';
import { Attachment } from './attachment.entity.js';
import { Trip } from './trip.entity.js';
import { StopType } from './stopType.enum.js';
import { StopStatus } from './stopStatus.enum.js';

@Entity()
export class Stop {
  constructor() {
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  @PrimaryKey({ autoincrement: true })
  id!: number;

  @Property()
  @Index({ type: 'fulltext' })
  name!: string;

  @Property({ nullable: true, type: 'text' })
  @Index({ type: 'fulltext' })
  notes?: string;

  @Property()
  createdAt: Date;

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date;

  @Property({ columnType: 'date' })
  desiredArrivalDate!: Date;

  @Property({ columnType: 'date' })
  actualArrivalDate!: Date;

  @Property({ type: 'double precision' })
  latitude!: number;

  @Property({ type: 'double precision' })
  longitude!: number;
  
  @ManyToOne()
  creator!: User;

  @ManyToOne()
  trip!: Trip;

  @Enum(() => StopType)
  type!: StopType;

  @Enum(() => StopStatus)
  status!: StopStatus;

  @OneToMany(() => Attachment, attachment => attachment.stop, { cascade: [Cascade.REMOVE] })
  attachments = new Collection<Attachment>(this);

  @Property({ nullable: true })
  importId?: string;
}
