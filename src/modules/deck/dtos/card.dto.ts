import {
	DateValidator,
	NumberValidator,
	StringValidator,
	StringValidatorOptional,
} from "@common/decorators";
import { type UUID } from "@common/types";
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
	examples?: string[];
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
