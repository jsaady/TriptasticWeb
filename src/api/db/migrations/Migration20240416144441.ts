import { Migration } from '@mikro-orm/migrations';

export class Migration20240416144441 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "user" add column "role" varchar(255) not null default \'user\';');
    this.addSql('alter table "user" drop column "is_admin";');
  }

  async down(): Promise<void> {
    this.addSql('alter table "user" add column "is_admin" boolean not null;');
    this.addSql('alter table "user" drop column "role";');
  }

}
