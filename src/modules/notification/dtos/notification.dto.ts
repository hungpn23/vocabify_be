import { DateValidator, StringValidator } from "@common/decorators";
import { QueryDto } from "@common/dtos";
import type { UUID } from "@common/types";
import { PickType } from "@nestjs/swagger";

export class GetNotificationsQueryDto extends PickType(QueryDto, [
	"limit",
] as const) {}

export class ReadNotificationDto {
	@StringValidator({ isUUID: true })
	id!: UUID;

	@DateValidator()
	readAt!: Date;
}
