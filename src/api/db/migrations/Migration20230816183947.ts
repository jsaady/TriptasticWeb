import { Migration } from '@mikro-orm/migrations';

export class Migration20230816183947 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "user" ("id" serial primary key, "created_at" varchar(255) not null, "updated_at" timestamptz(0) not null, "gitlab_id" varchar(255) null, "username" varchar(255) not null, "email" varchar(255) not null, "password" varchar(255) not null, "is_admin" boolean not null, "need_password_reset" boolean not null, "email_confirmed" boolean not null);');
  }

}
