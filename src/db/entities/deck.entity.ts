import { type UUID } from "@common/types";
import { NullableProperty } from "@common/utils";
import {
	BeforeCreate,
	BeforeUpdate,
	Collection,
	Entity,
	Enum,
	Filter,
	ManyToOne,
	OneToMany,
	Opt,
	Property,
	type Ref,
	t,
	Unique,
} from "@mikro-orm/core";
import { Visibility } from "@modules/deck/deck.enum";
import slugify from "slugify";
import { SoftDeleteBaseEntity } from "./base.entity";
import { Card } from "./card.entity";
import { User } from "./user.entity";

@Filter({ name: "deletedAt", cond: { deletedAt: null }, default: true })
@Unique({ properties: ["name", "owner"] })
@Unique({ properties: ["slug", "owner"] })
@Entity()
export class Deck extends SoftDeleteBaseEntity {
	@Property()
	name!: string;

	@Property()
	slug: Opt<string> = "";

	@NullableProperty()
	description?: string;

	@Enum(() => Visibility)
	visibility!: Visibility;

	@Property()
	passcode: Opt<string> = "";

	@Property()
	viewCount: Opt<number> = 0;

	@Property()
	learnerCount: Opt<number> = 0;

	@NullableProperty({ type: t.datetime })
	openedAt?: Date;

	@ManyToOne(() => Deck, { ref: true, nullable: true })
	clonedFrom?: Ref<Deck>;

	@ManyToOne(() => User, { ref: true })
	owner!: Ref<User>;

	@OneToMany(() => Card, "deck", { orphanRemoval: true })
	cards = new Collection<Card, Deck>(this);

	@Property()
	createdBy!: UUID;

	@NullableProperty()
	updatedBy?: UUID;

	@BeforeCreate()
	@BeforeUpdate()
	generateSlug() {
		this.slug = slugify(this.name, { lower: true, strict: true });
	}
}
