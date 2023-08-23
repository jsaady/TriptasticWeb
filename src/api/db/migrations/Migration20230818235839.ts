import { Migration } from '@mikro-orm/migrations';

export class Migration20230818235839 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "user_device" ("id" serial primary key, "credential_public_key" bytea not null, "credential_id" bytea not null, "counter" int not null);');
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists "user_device" cascade;');
  }

}
