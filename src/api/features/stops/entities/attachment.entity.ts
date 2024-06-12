import { Cascade, Collection, Entity, ManyToOne, OneToMany, PrimaryKey, Property, Rel } from '@mikro-orm/core';
import { Stop } from './stop.entity.js';
import { Thumbnail } from './thumbnail.entity.js';

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

  @OneToMany(() => Thumbnail, t => t.attachment, { cascade: [Cascade.REMOVE] })
  thumbnails = new Collection<Thumbnail>(this);
}
