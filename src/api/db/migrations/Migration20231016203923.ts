import { Migration } from '@mikro-orm/migrations';

export class Migration20231016203923 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "note" add column "created_by" int not null;');
  }

  async down(): Promise<void> {
    this.addSql('alter table "note" drop column "created_by";');
  }

}
