import { ActorDto } from "@api/user/user.dto";
import type { UUID } from "@common";

import { Exclude, Expose } from "class-transformer";

@Exclude()
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
