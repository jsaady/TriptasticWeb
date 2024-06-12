import { Cascade, Entity, ManyToOne, PrimaryKey, Property, Rel } from '@mikro-orm/core';
import { Stop } from './stop.entity.js';
import { Attachment } from './attachment.entity.js';

@Entity()
export class Thumbnail {
  constructor() {
    this.createdAt = new Date();
  }

  @PrimaryKey()
  id!: number;

  @Property()
  createdAt: Date;

  @Property()
  mimeType!: string;

  @Property()
  size!: number;

  @Property()
  fileName!: string;

  @Property({ nullable: true, columnType: 'integer' })
  width?: number;

  @Property({ nullable: true, columnType: 'integer' })
  height?: number;

  @Property()
  content!: Buffer;
  
  @ManyToOne(() => Attachment, { cascade: [Cascade.REMOVE] })
  attachment!: Rel<Attachment>;
}