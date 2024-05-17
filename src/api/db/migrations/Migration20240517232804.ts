import { Migration } from '@mikro-orm/migrations';

export class Migration20240517232804 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "user" add column "last_login_date" timestamptz(0) null;');
  }

  async down(): Promise<void> {
    this.addSql('alter table "user" drop column "last_login_date";');
  }
}
