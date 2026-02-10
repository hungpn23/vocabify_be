import { StringValidator, StringValidatorOptional } from "@common/decorators";
import type { LanguageCode } from "@modules/deck/deck.type";

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
