import { UserRole } from "@common/enums";
import { NullableProperty } from "@common/utils";
import {
	BeforeCreate,
	BeforeUpdate,
	Collection,
	Entity,
	Enum,
	OneToMany,
	Opt,
	Property,
} from "@mikro-orm/core";
import argon2 from "argon2";
import { BaseEntity } from "./base.entity";
import { Deck } from "./deck.entity";
import { Notification } from "./notification.entity";

@Entity()
export class User extends BaseEntity {
	@Property({ unique: true })
	username!: string;

	@Property({ unique: true })
	email!: string;

	@Property()
	emailVerified: Opt<boolean> = false;

	@NullableProperty({ hidden: true })
	password?: string | null;

	@NullableProperty()
	avatarUrl?: string | null;

	@Enum(() => UserRole)
	role: Opt<UserRole> = UserRole.USER;

	@OneToMany(() => Deck, "owner", { orphanRemoval: true })
	decks = new Collection<Deck, User>(this);

	@OneToMany(() => Notification, "recipient", { orphanRemoval: true })
	notifications = new Collection<Notification, User>(this);

	@BeforeCreate()
	@BeforeUpdate()
	async hashPassword() {
		if (this.password && !this.password.startsWith("$argon2")) {
			this.password = await argon2.hash(this.password);
		}
	}
}
