import { Cascade, Entity, ManyToOne, PrimaryKey, Property, Rel } from '@mikro-orm/core';
import { Stop } from './stop.entity.js';

@Entity()
export class Attachment {
  constructor() {
    this.createdAt = new Date();
  }

  @PrimaryKey({ autoincrement: true })
  id!: number;

  @Property()
  createdAt: Date;

  @Property()
  mimeType!: string;

  @Property()
  size!: number;

  @Property()
  fileName!: string;

  @Property()
  content!: Buffer;

  @ManyToOne(() => Stop, { cascade: [Cascade.REMOVE] })
  stop!: Rel<Stop>;
}
