import { Migration } from '@mikro-orm/migrations';

export class Migration20230818230958 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "user" add column "email_token" varchar(255) null, add column "email_token_date" timestamptz(0) null;');
  }

  async down(): Promise<void> {
    this.addSql('alter table "user" drop column "email_token";');
    this.addSql('alter table "user" drop column "email_token_date";');
  }

}
