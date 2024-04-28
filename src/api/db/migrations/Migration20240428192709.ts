import { Migration } from '@mikro-orm/migrations';

export class Migration20240428192709 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "attachment" drop constraint "attachment_stop_id_foreign";');

    this.addSql('alter table "attachment" alter column "stop_id" type int using ("stop_id"::int);');
    this.addSql('alter table "attachment" alter column "stop_id" drop not null;');
    this.addSql('alter table "attachment" add constraint "attachment_stop_id_foreign" foreign key ("stop_id") references "stop" ("id") on delete cascade;');
  }

  async down(): Promise<void> {
    this.addSql('alter table "attachment" drop constraint "attachment_stop_id_foreign";');

    this.addSql('alter table "attachment" alter column "stop_id" type int using ("stop_id"::int);');
    this.addSql('alter table "attachment" alter column "stop_id" set not null;');
    this.addSql('alter table "attachment" add constraint "attachment_stop_id_foreign" foreign key ("stop_id") references "stop" ("id") on update cascade;');
  }

}
