import { type UUID } from "@common/types";
import { createUUID, NullableProperty } from "@common/utils";
import {
	BeforeCreate,
	BeforeUpdate,
	Entity,
	Enum,
	ManyToOne,
	Opt,
	PrimaryKey,
	Property,
	type Ref,
	t,
} from "@mikro-orm/core";
import { CardStatus } from "@modules/deck/deck.enum";
import { type LanguageCode } from "@modules/deck/deck.type";
import { Deck } from "./deck.entity";

@Entity()
export class Card {
	@PrimaryKey({ type: t.uuid })
	id: Opt<UUID> = createUUID();

	@Property({ type: t.text })
	term!: string;

	@Property()
	termLanguage!: LanguageCode;

	@Property({ type: t.text })
	definition!: string;

	@Property()
	definitionLanguage!: LanguageCode;

	@NullableProperty()
	pronunciation?: string;

	@NullableProperty()
	partOfSpeech?: string;

	@NullableProperty()
	usageOrGrammar?: string;

	@Property({ type: t.array })
	examples: Opt<string[]> = [];

	@Property()
	streak: Opt<number> = 0;

	@NullableProperty()
	reviewDate?: Date;

	@Enum(() => CardStatus)
	status: Opt<CardStatus> = CardStatus.NEW;

	@ManyToOne(() => Deck, { ref: true })
	deck!: Ref<Deck>;

	@BeforeCreate()
	@BeforeUpdate()
	updateStatus() {
		const today = new Date();

		if (!this.reviewDate) {
			this.status = CardStatus.NEW;
		} else if (this.reviewDate > today) {
			this.status = CardStatus.KNOWN;
		} else {
			this.status = CardStatus.LEARNING;
		}
	}
}
