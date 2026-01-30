import type { LanguageCode } from "@api/deck/deck.type";
import { StringValidator } from "@common";
import { Exclude, Expose } from "class-transformer";

export class GetCardSuggestionDto {
	@StringValidator()
	term!: string;

	@StringValidator()
	termLanguage!: LanguageCode;

	@StringValidator()
	definitionLanguage!: LanguageCode;
}

@Exclude()
export class CardSuggestionDto {
	@Expose()
	definition!: string;

	@Expose()
	pronunciation?: string;

	@Expose()
	partOfSpeech?: string;

	@Expose()
	usageOrGrammar?: string;

	@Expose()
	examples!: string[];
}
