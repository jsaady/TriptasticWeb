import { Migration } from '@mikro-orm/migrations';

export class Migration20240515034337 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "user" drop column "gitlab_id";');

    this.addSql('alter table "stop" add column "import_id" varchar(255) null;');
  }

  async down(): Promise<void> {
    this.addSql('alter table "user" add column "gitlab_id" varchar(255) null;');

    this.addSql('alter table "stop" drop column "import_id";');
  }

}
