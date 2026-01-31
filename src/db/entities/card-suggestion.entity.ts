import type { LanguageCode } from "@api/deck/deck.type";
import { type UUID } from "@common/types";
import { createUUID, NullableProperty } from "@common/utils";
import { Entity, Opt, PrimaryKey, Property, t } from "@mikro-orm/core";

@Entity()
export class CardSuggestion {
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
	examples!: string[];
}
