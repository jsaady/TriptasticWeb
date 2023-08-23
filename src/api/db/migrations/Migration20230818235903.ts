import { Migration } from '@mikro-orm/migrations';

export class Migration20230818235903 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "user_device" add column "user_id" int not null;');
    this.addSql('alter table "user_device" add constraint "user_device_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade;');
  }

  async down(): Promise<void> {
    this.addSql('alter table "user_device" drop constraint "user_device_user_id_foreign";');

    this.addSql('alter table "user_device" drop column "user_id";');
  }

}
