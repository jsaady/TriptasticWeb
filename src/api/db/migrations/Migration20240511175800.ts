import { Migration } from '@mikro-orm/migrations';

export class Migration20240511175800 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "stop" add column "desired_arrival_date" timestamptz(0), add column "actual_arrival_date" timestamptz(0);');
    this.addSql('update "stop" set "desired_arrival_date" = current_timestamp;');
    this.addSql('update "stop" set "actual_arrival_date" = current_timestamp;');
    this.addSql('alter table "stop" alter column "desired_arrival_date" set not null;');
    this.addSql('alter table "stop" alter column "actual_arrival_date" set not null;');
  }

  async down(): Promise<void> {
    this.addSql('alter table "stop" drop column "desired_arrival_date";');
    this.addSql('alter table "stop" drop column "actual_arrival_date";');
  }

}
