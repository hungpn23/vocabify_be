import {
	DateValidator,
	NumberValidator,
	StringValidator,
	StringValidatorOptional,
} from "@common/decorators";
import { type UUID } from "@common/types";
import { OmitType } from "@nestjs/swagger";
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

	@StringValidator()
	fileId!: string;
}

export class UpdateCardDto extends OmitType(CreateCardDto, [
	"fileId",
] as const) {
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
