import { Migration } from '@mikro-orm/migrations';

export class Migration20240413152445 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "stop" add column "creator_id" int not null, add column "trip_id" int not null;');
    this.addSql('alter table "stop" alter column "latitude" type double precision using ("latitude"::double precision);');
    this.addSql('alter table "stop" alter column "longitude" type double precision using ("longitude"::double precision);');
    this.addSql('alter table "stop" add constraint "stop_creator_id_foreign" foreign key ("creator_id") references "user" ("id") on update cascade;');
    this.addSql('alter table "stop" add constraint "stop_trip_id_foreign" foreign key ("trip_id") references "trip" ("id") on update cascade;');
  }

  async down(): Promise<void> {
    this.addSql('alter table "stop" drop constraint "stop_creator_id_foreign";');
    this.addSql('alter table "stop" drop constraint "stop_trip_id_foreign";');

    this.addSql('alter table "stop" alter column "latitude" type int using ("latitude"::int);');
    this.addSql('alter table "stop" alter column "longitude" type int using ("longitude"::int);');
    this.addSql('alter table "stop" drop column "creator_id";');
    this.addSql('alter table "stop" drop column "trip_id";');
  }

}
