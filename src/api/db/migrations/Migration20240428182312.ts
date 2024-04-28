import { Migration } from '@mikro-orm/migrations';

export class Migration20240428182312 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "attachment" ("id" serial primary key, "created_at" timestamptz(0) not null, "mime_type" varchar(255) not null, "size" int not null, "file_name" varchar(255) not null, "content" bytea not null, "stop_id" int not null);');

    this.addSql('alter table "attachment" add constraint "attachment_stop_id_foreign" foreign key ("stop_id") references "stop" ("id") on update cascade;');
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists "attachment" cascade;');
  }

}
