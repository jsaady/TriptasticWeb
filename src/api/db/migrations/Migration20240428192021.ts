import { Migration } from '@mikro-orm/migrations';

export class Migration20240428192021 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "stop" add column "notes" text null;');
  }

  async down(): Promise<void> {
    this.addSql('alter table "stop" drop column "notes";');
  }

}
