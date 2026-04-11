import type { UUID } from "@common/types";
import type { NotificationType } from "@modules/notification/notification.type";
import { ActorResponseDto } from "@modules/user/user.res.dto";
import { Exclude, Expose } from "class-transformer";

@Exclude()
export class NotificationResponseDto {
	@Expose()
	id!: UUID;

	@Expose()
	type!: NotificationType;

	@Expose()
	content!: string;

	@Expose()
	readAt?: Date;

	@Expose()
	actor?: ActorResponseDto;

	@Expose()
	recipientId!: UUID;

	@Expose()
	createdAt!: Date;
}

@Exclude()
export class GetNotificationsResponseDto {
	@Expose()
	data!: NotificationResponseDto[];

	@Expose()
	totalRecords!: number;
}
