import {
	DateValidator,
	NumberValidator,
	StringValidator,
	StringValidatorOptional,
} from "@common/decorators/validators.decorator";
import { type UUID } from "@common/types/branded.type";
import { PickType } from "@nestjs/swagger";
import { Exclude, Expose } from "class-transformer";
import { CardStatus } from "../deck.enum";
import type { LanguageCode } from "../deck.type";

export class CreateCardDto {
	@StringValidator()
	term!: string;

	@StringValidator()
	termLanguage!: LanguageCode;

	@StringValidator()
	definition!: string;

	@StringValidator()
	definitionLanguage!: LanguageCode;

	@StringValidatorOptional()
	pronunciation?: string;

	@StringValidatorOptional()
	partOfSpeech?: string;

	@StringValidatorOptional()
	usageOrGrammar?: string;

	@StringValidatorOptional({ isArray: true })
	examples?: string[] | null;
}

export class UpdateCardDto extends CreateCardDto {
	@StringValidator({ isUUID: true })
	id!: UUID;
}

export class CardAnswerDto {
	@StringValidator({ isUUID: true })
	id!: UUID;

	@NumberValidator()
	streak!: number;

	@DateValidator()
	reviewDate!: Date;
}

@Exclude()
export class CardDto {
	@Expose()
	id!: UUID;

	@Expose()
	term!: string;

	@Expose()
	termLanguage!: LanguageCode;

	@Expose()
	definition!: string;

	@Expose()
	definitionLanguage!: LanguageCode;

	@Expose()
	pronunciation?: string;

	@Expose()
	partOfSpeech?: string;

	@Expose()
	usageOrGrammar?: string;

	@Expose()
	examples!: string[];

	@Expose()
	streak!: number;

	@Expose()
	reviewDate?: Date | null;

	@Expose()
	status!: CardStatus;
}

@Exclude()
export class PreviewCardDto extends PickType(CardDto, [
	"id",
	"term",
	"definition",
	"pronunciation",
	"partOfSpeech",
	"usageOrGrammar",
	"examples",
]) {}
