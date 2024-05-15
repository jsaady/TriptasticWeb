import { Migration } from '@mikro-orm/migrations';

export class Migration20240515203158 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "user_notification_preference" ("id" serial primary key, "user_id" int not null, "subscribe_to_all_stops" boolean not null);');
    this.addSql('alter table "user_notification_preference" add constraint "user_notification_preference_user_id_unique" unique ("user_id");');

    this.addSql('create table "user_stop_notification_preference" ("id" serial primary key, "stop_id" int null, "user_notification_preference_id" int null);');

    this.addSql('alter table "user_notification_preference" add constraint "user_notification_preference_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade;');

    this.addSql('alter table "user_stop_notification_preference" add constraint "user_stop_notification_preference_stop_id_foreign" foreign key ("stop_id") references "stop" ("id") on delete cascade;');
    this.addSql('alter table "user_stop_notification_preference" add constraint "user_stop_notification_preference_user_notificati_15994_foreign" foreign key ("user_notification_preference_id") references "user_notification_preference" ("id") on delete cascade;');
  }

  async down(): Promise<void> {
    this.addSql('alter table "user_stop_notification_preference" drop constraint "user_stop_notification_preference_user_notificati_15994_foreign";');

    this.addSql('drop table if exists "user_notification_preference" cascade;');

    this.addSql('drop table if exists "user_stop_notification_preference" cascade;');
  }

}
