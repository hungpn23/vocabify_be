import { CardStatus } from "@api/deck/deck.enum";
import { type LanguageCode } from "@api/deck/deck.type";
import { type UUID } from "@common/types/branded.type";
import { createUUID } from "@common/utils";
import { NullableProperty } from "@common/utils/nullable-property";
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

	@NullableProperty({ type: t.array })
	examples?: string[] | null;

	@Property()
	streak: Opt<number> = 0;

	@NullableProperty()
	reviewDate?: Date | null;

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
