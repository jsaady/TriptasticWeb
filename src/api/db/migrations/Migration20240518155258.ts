import { Migration } from '@mikro-orm/migrations';

export class Migration20240518155258 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "user" alter column "last_login_date" type timestamptz(0) using ("last_login_date"::timestamptz(0));');
    this.addSql('alter table "user" add constraint "user_email_unique" unique ("email");');
    this.addSql('alter table "user" add constraint "user_username_unique" unique ("username");');

    this.addSql('create index "stop_name_index" on "public"."stop" using gin(to_tsvector(\'simple\', "name"));');
    this.addSql('create index "stop_notes_index" on "public"."stop" using gin(to_tsvector(\'simple\', "notes"));');
  }

  async down(): Promise<void> {
    this.addSql('alter table "user" alter column "last_login_date" type varchar(255) using ("last_login_date"::varchar(255));');
    this.addSql('alter table "user" drop constraint "user_email_unique";');
    this.addSql('alter table "user" drop constraint "user_username_unique";');

    this.addSql('drop index "stop_name_index";');
    this.addSql('drop index "stop_notes_index";');
  }

}
