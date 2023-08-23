import { Migration } from '@mikro-orm/migrations';

export class Migration20230819000743 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "user" add column "current_web_authn_challenge" varchar(255) null;');
  }

  async down(): Promise<void> {
    this.addSql('alter table "user" drop column "current_web_authn_challenge";');
  }

}
