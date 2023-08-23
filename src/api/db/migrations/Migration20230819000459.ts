import { Migration } from '@mikro-orm/migrations';

export class Migration20230819000459 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "user_device" alter column "transports" type jsonb using ("transports"::jsonb);');
    this.addSql('alter table "user_device" alter column "transports" drop not null;');
  }

  async down(): Promise<void> {
    this.addSql('alter table "user_device" alter column "transports" type jsonb using ("transports"::jsonb);');
    this.addSql('alter table "user_device" alter column "transports" set not null;');
  }

}
