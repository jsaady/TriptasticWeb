import { Migration } from '@mikro-orm/migrations';

export class Migration20240413140758 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "stop" ("id" serial primary key, "name" varchar(255) not null, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) not null, "latitude" int not null, "longitude" int not null);');

    this.addSql('create table "trip" ("id" serial primary key, "name" varchar(255) not null, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) not null, "creator_id" int not null);');

    this.addSql('alter table "trip" add constraint "trip_creator_id_foreign" foreign key ("creator_id") references "user" ("id") on update cascade;');

    this.addSql('drop table if exists "note" cascade;');
  }

  async down(): Promise<void> {
    this.addSql('create table "note" ("id" serial primary key, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) not null, "note" varchar(255) not null, "embeddings" vector not null, "has_embeddings" boolean not null default false, "created_by" int not null);');

    this.addSql('drop table if exists "stop" cascade;');

    this.addSql('drop table if exists "trip" cascade;');
  }

}
