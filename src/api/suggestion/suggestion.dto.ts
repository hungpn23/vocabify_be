import type { LanguageCode } from "@api/deck/deck.type";
import { StringValidator, StringValidatorOptional } from "@common/decorators";

export class GetTermSuggestionDto {
	@StringValidator()
	term!: string;

	@StringValidatorOptional()
	partOfSpeech?: string;

	@StringValidator()
	termLanguage!: LanguageCode;

	@StringValidator()
	definitionLanguage!: LanguageCode;
}

export class GetNextCardSuggestionDto {
	@StringValidator()
	term!: string;

	@StringValidator()
	definition!: string;

	@StringValidator()
	termLanguage!: LanguageCode;

	@StringValidator()
	definitionLanguage!: LanguageCode;
}
