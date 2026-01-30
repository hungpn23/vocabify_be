import { Entity, ManyToOne, Property, type Ref } from "@mikro-orm/core";
import { BaseEntity } from "./base.entity";
import { User } from "./user.entity";

@Entity()
export class Session extends BaseEntity {
	@Property()
	signature!: string;

	@Property()
	expiresAt!: Date;

	@ManyToOne(() => User, { ref: true })
	user!: Ref<User>;
}
