import { UserRole } from "@common/enums";
import { HiddenProperty } from "@common/utils";
import {
	BeforeCreate,
	BeforeUpdate,
	Collection,
	Embedded,
	Entity,
	Enum,
	OneToMany,
	Opt,
	Property,
} from "@mikro-orm/core";
import argon2 from "argon2";
import { MediaInfo } from "../embeddables";
import { BaseEntity } from "./base.entity";
import { Notification } from "./notification.entity";

@Entity()
export class User extends BaseEntity {
	@Property({ unique: true })
	username!: string;

	@Property({ unique: true })
	email!: string;

	@Property()
	emailVerified: Opt<boolean> = false;

	@HiddenProperty({ nullable: true })
	password?: string;

	@Embedded(() => MediaInfo, { nullable: true, prefix: "avatar_" })
	avatar?: MediaInfo;

	@Enum(() => UserRole)
	role: Opt<UserRole> = UserRole.USER;

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
