import { Migration } from '@mikro-orm/migrations';

export class Migration20230816215559 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "user" drop column "username";');
  }

  async down(): Promise<void> {
    this.addSql('alter table "user" add column "username" varchar(255) not null;');
  }

}
