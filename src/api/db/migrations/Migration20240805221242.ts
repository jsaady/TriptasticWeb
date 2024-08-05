import { Migration } from '@mikro-orm/migrations';

export class Migration20240805221242 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "stop" drop constraint if exists "stop_status_check";');

    this.addSql('alter table "stop" alter column "status" type text using ("status"::text);');
    this.addSql('alter table "stop" add constraint "stop_status_check" check ("status" in (\'UPCOMING\', \'ACTIVE\', \'COMPLETED\', \'ARCHIVED\'));');
  }

  async down(): Promise<void> {
    this.addSql('alter table "stop" drop constraint if exists "stop_status_check";');

    this.addSql('alter table "stop" alter column "status" type text using ("status"::text);');
    this.addSql('alter table "stop" add constraint "stop_status_check" check ("status" in (\'UPCOMING\', \'ACTIVE\', \'COMPLETED\'));');
  }

}
