import { Migration } from '@mikro-orm/migrations';

export class Migration20240516005136 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "stop" alter column "desired_arrival_date" type date using ("desired_arrival_date"::date);');
    this.addSql('alter table "stop" alter column "actual_arrival_date" type date using ("actual_arrival_date"::date);');
  }

  async down(): Promise<void> {
    this.addSql('alter table "stop" alter column "desired_arrival_date" type timestamptz(0) using ("desired_arrival_date"::timestamptz(0));');
    this.addSql('alter table "stop" alter column "actual_arrival_date" type timestamptz(0) using ("actual_arrival_date"::timestamptz(0));');
  }

}
