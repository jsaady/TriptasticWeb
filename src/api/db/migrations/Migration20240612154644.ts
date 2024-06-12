import { Migration } from '@mikro-orm/migrations';

export class Migration20240612154644 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "thumbnail" alter column "width" type integer using ("width"::integer);');
    this.addSql('alter table "thumbnail" alter column "width" drop not null;');
    this.addSql('alter table "thumbnail" alter column "height" type integer using ("height"::integer);');
    this.addSql('alter table "thumbnail" alter column "height" drop not null;');
  }

  async down(): Promise<void> {
    this.addSql('alter table "thumbnail" alter column "width" type int using ("width"::int);');
    this.addSql('alter table "thumbnail" alter column "width" set not null;');
    this.addSql('alter table "thumbnail" alter column "height" type int using ("height"::int);');
    this.addSql('alter table "thumbnail" alter column "height" set not null;');
  }

}
