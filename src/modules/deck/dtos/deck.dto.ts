import {
	ClassValidator,
	ClassValidatorOptional,
	EnumValidator,
	EnumValidatorOptional,
	StringValidator,
	StringValidatorOptional,
} from "@common/decorators";
import { QueryDto } from "@common/dtos";
import { ApiProperty, PickType } from "@nestjs/swagger";
import { ArrayMinSize, ValidateIf } from "class-validator";
import { DeckOrderBy, Visibility } from "../deck.enum";
import { CreateCardDto, UpdateCardDto } from "./card.dto";

export class CreateDeckDto {
	@StringValidator({ minLength: 3 })
	name!: string;

	@StringValidatorOptional()
	description?: string;

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

export class UploadDeckCardImagesDto {
	@ApiProperty({
		description: "JSON string mapping file index to card id",
		example:
			'[{"cardId":"0f8fad5b-d9cb-469f-a165-70867728950e","fileIndex":0},{"cardId":"7c9e6679-7425-40de-944b-e07fc1f90ae7","fileIndex":1}]',
	})
	@StringValidator()
	mappings!: string;
}

export class GetDecksQueryDto extends QueryDto {
	@EnumValidatorOptional(DeckOrderBy)
	orderBy: DeckOrderBy = DeckOrderBy.OPENED_AT;
}
