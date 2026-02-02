import { ActorDto } from "@api/user/user.dto";
import type { UUID } from "@common/types";

import { Expose } from "class-transformer";

export class NotificationDto {
	@Expose()
	id!: UUID;

	@Expose()
	entityId!: UUID;

	@Expose()
	content!: string;

	@Expose()
	readAt?: Date | null;

	@Expose()
	actor?: ActorDto | null;

	@Expose()
	createdAt!: Date;
}
