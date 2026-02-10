import {
	ClassValidator,
	ClassValidatorOptional,
	EnumValidator,
	EnumValidatorOptional,
	StringValidator,
	StringValidatorOptional,
} from "@common/decorators";
import { QueryDto } from "@common/dtos";
import { PickType } from "@nestjs/swagger";
import { ArrayMinSize, ValidateIf } from "class-validator";
import { DeckOrderBy, Visibility } from "../deck.enum";
import { CreateCardDto, UpdateCardDto } from "./card.dto";

export class CreateDeckDto {
	@StringValidator({ minLength: 3 })
	name!: string;

	@StringValidatorOptional()
	description?: string | null;

	@EnumValidator(Visibility)
	visibility!: Visibility;

	/**
	 * Required if visibility is PROTECTED. Must be 4-20 characters.
	 */
	@ValidateIf((o) => (o as CreateDeckDto).visibility === Visibility.PROTECTED)
	@StringValidator({ minLength: 4, maxLength: 20 })
	passcode?: string;

	// @ApiProperty({ type: () => [CreateCardDto], minItems: 4 })
	@ArrayMinSize(4)
	@ClassValidator(CreateCardDto, { isArray: true })
	cards!: CreateCardDto[];
}

export class UpdateDeckDto extends PickType(CreateDeckDto, [
	"description",
	"passcode",
]) {
	@StringValidatorOptional({ minLength: 3 })
	name?: string;

	@EnumValidatorOptional(Visibility)
	visibility?: Visibility;

	@ClassValidatorOptional(UpdateCardDto, { isArray: true })
	cards?: UpdateCardDto[];
}

export class CloneDeckDto {
	@StringValidatorOptional()
	passcode?: string;
}

export class GetManyQueryDto extends QueryDto {
	@EnumValidatorOptional(DeckOrderBy)
	orderBy: DeckOrderBy = DeckOrderBy.OPENED_AT;
}
