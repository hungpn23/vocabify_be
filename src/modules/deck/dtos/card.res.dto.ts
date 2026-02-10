import { type UUID } from "@common/types";
import { PickType } from "@nestjs/swagger";
import { Exclude, Expose } from "class-transformer";
import { CardStatus } from "../deck.enum";
import type { LanguageCode } from "../deck.type";

@Exclude()
export class CardResponseDto {
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
export class PreviewCardResponseDto extends PickType(CardResponseDto, [
	"id",
	"term",
	"definition",
	"pronunciation",
	"partOfSpeech",
	"usageOrGrammar",
	"examples",
]) {}
