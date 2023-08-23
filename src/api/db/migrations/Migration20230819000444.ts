import { Migration } from '@mikro-orm/migrations';

export class Migration20230819000444 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "user_device" add column "transports" jsonb not null;');
  }

  async down(): Promise<void> {
    this.addSql('alter table "user_device" drop column "transports";');
  }

}
