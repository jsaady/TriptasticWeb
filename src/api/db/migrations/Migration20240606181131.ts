import { Migration } from '@mikro-orm/migrations';

export class Migration20240606181131 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "thumbnail" ("id" serial primary key, "created_at" timestamptz(0) not null, "mime_type" varchar(255) not null, "size" int not null, "file_name" varchar(255) not null, "content" bytea not null, "width" int not null, "height" int not null, "attachment_id" int null);');

    this.addSql('create table "user_invitation" ("id" serial primary key, "invite_code" varchar(255) not null, "inviter_id" int not null);');

    this.addSql('alter table "thumbnail" add constraint "thumbnail_attachment_id_foreign" foreign key ("attachment_id") references "attachment" ("id") on delete cascade;');

    this.addSql('alter table "user_invitation" add constraint "user_invitation_inviter_id_foreign" foreign key ("inviter_id") references "user" ("id") on update cascade;');
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists "thumbnail" cascade;');

    this.addSql('drop table if exists "user_invitation" cascade;');
  }

}
