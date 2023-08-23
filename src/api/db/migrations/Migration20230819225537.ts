import { Migration } from '@mikro-orm/migrations';

export class Migration20230819225537 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "user_device" add column "name" varchar(255) not null;');
  }

  async down(): Promise<void> {
    this.addSql('alter table "user_device" drop column "name";');
  }

}
