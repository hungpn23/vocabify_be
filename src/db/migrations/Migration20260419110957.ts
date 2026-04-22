import { Migration } from "@mikro-orm/migrations";

export class Migration20260419110957 extends Migration {
	override async up(): Promise<void> {
		this.addSql(
			`create table "card_suggestion" ("id" uuid not null, "term" text not null, "term_language" varchar(255) not null, "definition" text not null, "definition_language" varchar(255) not null, "pronunciation" varchar(255) null, "part_of_speech" varchar(255) null, "usage_or_grammar" varchar(255) null, "examples" text[] not null, constraint "card_suggestion_pkey" primary key ("id"));`,
		);

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
			`create table "pending_media" ("id" uuid not null, "pending_url" varchar(255) not null, "pending_file_id" varchar(255) not null, "pending_file_path" varchar(255) not null, "owner_id" uuid not null, "created_at" timestamptz not null, constraint "pending_media_pkey" primary key ("id"));`,
		);
		this.addSql(
			`create index "pending_media_created_at_index" on "pending_media" ("created_at");`,
		);

		this.addSql(
			`create table "notification" ("id" uuid not null, "created_at" timestamptz not null, "updated_at" timestamptz null, "entity_id" uuid not null, "type" varchar(255) not null, "content" varchar(255) not null, "read_at" timestamptz null, "actor_id" uuid null, "recipient_id" uuid not null, constraint "notification_pkey" primary key ("id"));`,
		);

		this.addSql(
			`create table "deck" ("id" uuid not null, "created_at" timestamptz not null, "updated_at" timestamptz null, "deleted_at" timestamptz null, "name" varchar(255) not null, "slug" varchar(255) not null default '', "description" varchar(255) null, "visibility" text check ("visibility" in ('public', 'protected', 'private')) not null, "passcode" varchar(255) not null default '', "view_count" int not null default 0, "learner_count" int not null default 0, "opened_at" timestamptz null, "cloned_from_id" uuid null, "owner_id" uuid not null, "created_by" varchar(255) not null, "updated_by" varchar(255) null, constraint "deck_pkey" primary key ("id"));`,
		);
		this.addSql(
			`alter table "deck" add constraint "deck_slug_owner_id_unique" unique ("slug", "owner_id");`,
		);
		this.addSql(
			`alter table "deck" add constraint "deck_name_owner_id_unique" unique ("name", "owner_id");`,
		);

		this.addSql(
			`create table "card" ("id" uuid not null, "term" text not null, "term_language" varchar(255) not null, "definition" text not null, "definition_language" varchar(255) not null, "image_url" varchar(255) null, "image_file_id" varchar(255) null, "image_file_path" varchar(255) null, "pronunciation" varchar(255) null, "part_of_speech" varchar(255) null, "usage_or_grammar" varchar(255) null, "examples" text[] not null, "streak" int not null default 0, "review_date" timestamptz null, "status" text check ("status" in ('known', 'learning', 'new')) not null default 'new', "deck_id" uuid not null, constraint "card_pkey" primary key ("id"));`,
		);

		this.addSql(
			`create table "user_statistic" ("id" uuid not null, "last_study_date" timestamptz null, "current_streak" int not null default 0, "longest_streak" int not null default 0, "total_cards_learned" int not null default 0, "mastery_rate" real not null default 0, "user_id" uuid not null, constraint "user_statistic_pkey" primary key ("id"));`,
		);
		this.addSql(
			`alter table "user_statistic" add constraint "user_statistic_user_id_unique" unique ("user_id");`,
		);

		this.addSql(
			`alter table "pending_media" add constraint "pending_media_owner_id_foreign" foreign key ("owner_id") references "user" ("id") on update cascade;`,
		);

		this.addSql(
			`alter table "notification" add constraint "notification_actor_id_foreign" foreign key ("actor_id") references "user" ("id") on update cascade on delete set null;`,
		);
		this.addSql(
			`alter table "notification" add constraint "notification_recipient_id_foreign" foreign key ("recipient_id") references "user" ("id") on update cascade;`,
		);

		this.addSql(
			`alter table "deck" add constraint "deck_cloned_from_id_foreign" foreign key ("cloned_from_id") references "deck" ("id") on update cascade on delete set null;`,
		);
		this.addSql(
			`alter table "deck" add constraint "deck_owner_id_foreign" foreign key ("owner_id") references "user" ("id") on update cascade;`,
		);

		this.addSql(
			`alter table "card" add constraint "card_deck_id_foreign" foreign key ("deck_id") references "deck" ("id") on update cascade;`,
		);

		this.addSql(
			`alter table "user_statistic" add constraint "user_statistic_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade on delete cascade;`,
		);
	}

	override async down(): Promise<void> {
		this.addSql(
			`alter table "pending_media" drop constraint "pending_media_owner_id_foreign";`,
		);

		this.addSql(
			`alter table "notification" drop constraint "notification_actor_id_foreign";`,
		);

		this.addSql(
			`alter table "notification" drop constraint "notification_recipient_id_foreign";`,
		);

		this.addSql(`alter table "deck" drop constraint "deck_owner_id_foreign";`);

		this.addSql(
			`alter table "user_statistic" drop constraint "user_statistic_user_id_foreign";`,
		);

		this.addSql(
			`alter table "deck" drop constraint "deck_cloned_from_id_foreign";`,
		);

		this.addSql(`alter table "card" drop constraint "card_deck_id_foreign";`);

		this.addSql(`drop table if exists "card_suggestion" cascade;`);

		this.addSql(`drop table if exists "user" cascade;`);

		this.addSql(`drop table if exists "pending_media" cascade;`);

		this.addSql(`drop table if exists "notification" cascade;`);

		this.addSql(`drop table if exists "deck" cascade;`);

		this.addSql(`drop table if exists "card" cascade;`);

		this.addSql(`drop table if exists "user_statistic" cascade;`);
	}
}
