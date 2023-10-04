import { Migration } from '@mikro-orm/migrations';

export class Migration20230913184653 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "user" add column "username" varchar(255) not null;');
  }

  async down(): Promise<void> {
    this.addSql('alter table "user" drop column "username";');
  }

}
