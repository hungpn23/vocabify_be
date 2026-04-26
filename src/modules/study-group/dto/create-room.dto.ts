import {
	ClassValidator,
	EnumValidator,
	NumberValidator,
	NumberValidatorOptional,
	StringValidator,
} from "@common/decorators";
import { EndCondition, QuestionType } from "../study-group.enum";

export class RoomSettingsDto {
	@EnumValidator(QuestionType)
	questionTypes!: QuestionType;

	@EnumValidator(EndCondition)
	endCondition!: EndCondition;

	@NumberValidatorOptional({ isInt: true, minimum: 1, maximum: 60 })
	timeLimitMinutes?: number;

	@NumberValidator({ isInt: true, minimum: 2, maximum: 8 })
	maxPlayers!: number;
}

export class CreateRoomDto {
	@StringValidator({ minLength: 1, maxLength: 100 })
	name!: string;

	@StringValidator({ isUUID: true, isArray: true })
	deckIds!: string[];

	@ClassValidator(RoomSettingsDto)
	settings!: RoomSettingsDto;
}
