import { Migration } from '@mikro-orm/migrations';

export class Migration20231016202751 extends Migration {

  async up(): Promise<void> {
    this.addSql('create extension vector');
    this.addSql('create table "note" ("id" serial primary key, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) not null, "note" varchar(255) not null, "embeddings" vector not null, "has_embeddings" boolean not null default false);');
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists "note" cascade;');
  }

}
