import { Migration } from '@mikro-orm/migrations';

export class Migration20240502012908 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "stop" add column "type" text check ("type" in (\'NATIONAL_PARK\', \'HOCKEY_CITY\', \'PIT_STOP\', \'HIDDEN_GEM\', \'FAMILY_AND_FRIENDS\')) null;');
    this.addSql('update "stop" set "type" = \'NATIONAL_PARK\' where "type" is null;');
    this.addSql('alter table "stop" alter column "type" set not null;');
  }

  async down(): Promise<void> {
    this.addSql('alter table "stop" drop column "type";');
  }

}
