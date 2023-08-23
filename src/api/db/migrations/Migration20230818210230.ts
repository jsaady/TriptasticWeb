import { Migration } from '@mikro-orm/migrations';

export class Migration20230818210230 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "subscription" ("id" serial primary key, "user_id" int not null, "endpoint" varchar(255) not null, "keys" jsonb not null);');

    this.addSql('alter table "subscription" add constraint "subscription_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade;');
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists "subscription" cascade;');
  }

}
