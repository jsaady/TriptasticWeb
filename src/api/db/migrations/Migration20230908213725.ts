import { Migration } from '@mikro-orm/migrations';

export class Migration20230908213725 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "user_client" ("id" serial primary key, "client_id" varchar(255) not null, "user_id" int not null);');

    this.addSql('alter table "user_client" add constraint "user_client_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade;');
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists "user_client" cascade;');
  }
}
