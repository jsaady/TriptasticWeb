import { Migration } from '@mikro-orm/migrations';

export class Migration20230908205542 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "generated_config" ("id" serial primary key, "jwt_secret" varchar(255) not null, "cookie_secret" varchar(255) not null, "vapid_public" varchar(255) not null, "vapid_private" varchar(255) not null, "env_url" varchar(255) not null, "env_name" varchar(255) not null, "email_host" varchar(255) not null, "email_port" varchar(255) not null, "email_user" varchar(255) not null, "email_password" varchar(255) not null, "email_reply_to" varchar(255) not null);');

    this.addSql('alter table "user" alter column "created_at" type timestamptz(0) using ("created_at"::timestamptz(0));');
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists "generated_config" cascade;');

    this.addSql('alter table "user" alter column "created_at" type varchar using ("created_at"::varchar);');
  }

}
