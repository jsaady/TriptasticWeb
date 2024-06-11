import { Migration } from '@mikro-orm/migrations';

export class Migration20240611230840 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "stop" add column "sort_order" numeric(10,0) null;');
  }

  async down(): Promise<void> {
    this.addSql('alter table "stop" drop column "sort_order";');
  }

}
