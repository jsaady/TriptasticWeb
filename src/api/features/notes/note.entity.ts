import { Entity, Property } from '@mikro-orm/core';
import { BaseEntity } from '../../db/base.js';
import { VectorType } from '../../db/vector.type.js';

@Entity()
export class Note extends BaseEntity {
  @Property()
  note!: string;

  @Property({ type: VectorType })
  embeddings!: number[];

  @Property({ default: false })
  hasEmbeddings: boolean = false;

  @Property()
  createdBy!: number;
}
