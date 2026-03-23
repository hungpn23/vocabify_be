import { QueryDto } from "@common/dtos";
import { PickType } from "@nestjs/swagger";

export class GetNotificationsQueryDto extends PickType(QueryDto, [
	"limit",
] as const) {}
