import { Migration } from "@mikro-orm/migrations";

export class Migration20260423103812 extends Migration {
	override async up(): Promise<void> {
		this.addSql(
			`create table "user" ("id" uuid not null, "created_at" timestamptz not null, "updated_at" timestamptz null, "username" varchar(255) not null, "email" varchar(255) not null, "email_verified" boolean not null default false, "password" varchar(255) null, "avatar_url" varchar(255) null, "avatar_file_id" varchar(255) null, "avatar_file_path" varchar(255) null, "role" text check ("role" in ('user', 'admin')) not null default 'user', constraint "user_pkey" primary key ("id"));`,
		);
		this.addSql(
			`alter table "user" add constraint "user_username_unique" unique ("username");`,
		);
		this.addSql(
			`alter table "user" add constraint "user_email_unique" unique ("email");`,
		);

		this.addSql(
			`create table "notification" ("id" uuid not null, "created_at" timestamptz not null, "updated_at" timestamptz null, "type" varchar(255) not null, "content" varchar(255) not null, "read_at" timestamptz null, "actor_id" uuid null, "recipient_id" uuid not null, constraint "notification_pkey" primary key ("id"));`,
		);

		this.addSql(
			`alter table "notification" add constraint "notification_actor_id_foreign" foreign key ("actor_id") references "user" ("id") on update cascade on delete set null;`,
		);
		this.addSql(
			`alter table "notification" add constraint "notification_recipient_id_foreign" foreign key ("recipient_id") references "user" ("id") on update cascade;`,
		);
	}
}
