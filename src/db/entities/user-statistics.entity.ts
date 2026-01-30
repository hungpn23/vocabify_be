import { type UUID } from "@common/types/branded.type";
import { createUUID } from "@common/utils";
import { NullableProperty } from "@common/utils/nullable-property";
import {
	Entity,
	OneToOne,
	Opt,
	PrimaryKey,
	Property,
	type Ref,
	t,
} from "@mikro-orm/core";
import { User } from "./user.entity";

@Entity()
export class UserStatistic {
	@PrimaryKey({ type: t.uuid })
	id: Opt<UUID> = createUUID();

	@NullableProperty()
	lastStudyDate?: Date | null;

	@Property()
	currentStreak: Opt<number> = 0;

	@Property()
	longestStreak: Opt<number> = 0;

	@Property()
	totalCardsLearned: Opt<number> = 0;

	@Property({ type: t.float })
	masteryRate: Opt<number> = 0;

	@OneToOne(() => User, { ref: true, owner: true, deleteRule: "cascade" })
	user!: Ref<User>;
}
