import type { LanguageCode } from "@api/deck/deck.type";
import { Exclude, Expose } from "class-transformer";

@Exclude()
export class TermSuggestionResponseDto {
	@Expose()
	definition!: string;

	@Expose()
	pronunciation?: string;

	@Expose()
	partOfSpeech?: string;

	@Expose()
	usageOrGrammar?: string | null;

	@Expose()
	examples!: string[];
}

@Exclude()
export class NextCardSuggestionResponseDto extends TermSuggestionResponseDto {
	@Expose()
	term!: string;

	@Expose()
	termLanguage!: LanguageCode;

	@Expose()
	definitionLanguage!: LanguageCode;
}
