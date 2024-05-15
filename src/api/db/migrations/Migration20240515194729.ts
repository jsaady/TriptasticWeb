import { Migration } from '@mikro-orm/migrations';

export class Migration20240515194729 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "stop" add column "status" text check ("status" in (\'UPCOMING\', \'ACTIVE\', \'COMPLETED\')) not null default \'UPCOMING\';');
  }

  async down(): Promise<void> {
    this.addSql('alter table "stop" drop column "status";');
  }

}
