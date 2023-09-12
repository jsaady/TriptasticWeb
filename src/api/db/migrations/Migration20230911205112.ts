import { Migration } from '@mikro-orm/migrations';

export class Migration20230911205112 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "generated_config" drop column "env_url";');
    this.addSql('alter table "generated_config" drop column "env_name";');
    this.addSql('alter table "generated_config" drop column "email_host";');
    this.addSql('alter table "generated_config" drop column "email_port";');
    this.addSql('alter table "generated_config" drop column "email_user";');
    this.addSql('alter table "generated_config" drop column "email_password";');
    this.addSql('alter table "generated_config" drop column "email_reply_to";');
  }

  async down(): Promise<void> {
    this.addSql('alter table "generated_config" add column "env_url" varchar not null default null, add column "env_name" varchar not null default null, add column "email_host" varchar not null default null, add column "email_port" varchar not null default null, add column "email_user" varchar not null default null, add column "email_password" varchar not null default null, add column "email_reply_to" varchar not null default null;');
  }

}
