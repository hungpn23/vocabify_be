import { StringValidatorOptional } from "@common/decorators";

export class JoinRoomDto {
	@StringValidatorOptional()
	roomId?: string;

	@StringValidatorOptional()
	passcode?: string;
}
