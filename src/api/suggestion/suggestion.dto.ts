import type { LanguageCode } from "@api/deck/deck.type";
import { StringValidator, StringValidatorOptional } from "@common/decorators";
import { OmitType } from "@nestjs/swagger";
import { Exclude, Expose } from "class-transformer";

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

export class GetCardSuggestionDto extends OmitType(GetTermSuggestionDto, [
	"partOfSpeech",
]) {
	@StringValidator()
	definition!: string;
}

/**
 * @todo implement this
 */
export class GetDeckSuggestionDto {}

@Exclude()
export class TermSuggestionResponseDto {
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

@Exclude()
export class CardSuggestionResponseDto extends TermSuggestionResponseDto {
	@Expose()
	term!: string;
}

/**
 * @todo implement this
 */
@Exclude()
export class DeckSuggestionResponseDto {}
