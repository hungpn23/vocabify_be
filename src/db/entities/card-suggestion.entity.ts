import type { LanguageCode } from "@api/deck/deck.type";
import { type UUID } from "@common/types/branded.type";
import { NullableProperty } from "@common/utils/nullable-property";
import { Entity, Opt, PrimaryKey, Property, t } from "@mikro-orm/core";
import { v4 } from "uuid";

@Entity()
export class CardSuggestion {
	@PrimaryKey({ type: t.uuid })
	id: Opt<UUID> = v4() as UUID;

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
	examples!: string[];
}
