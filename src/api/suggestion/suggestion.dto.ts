import type { LanguageCode } from "@api/deck/deck.type";
import { StringValidator, StringValidatorOptional } from "@common/decorators";
import { Expose } from "class-transformer";

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

export class NextCardSuggestionResponseDto extends TermSuggestionResponseDto {
	@Expose()
	term!: string;

	@Expose()
	termLanguage!: LanguageCode;

	@Expose()
	definitionLanguage!: LanguageCode;
}
