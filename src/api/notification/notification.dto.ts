import { ActorResponseDto } from "@api/user/user.res.dto";
import type { UUID } from "@common/types";

import { Exclude, Expose } from "class-transformer";

@Exclude()
export class NotificationResponseDto {
	@Expose()
	id!: UUID;

	@Expose()
	entityId!: UUID;

	@Expose()
	content!: string;

	@Expose()
	readAt?: Date | null;

	@Expose()
	actor?: ActorResponseDto | null;

	@Expose()
	createdAt!: Date;
}
