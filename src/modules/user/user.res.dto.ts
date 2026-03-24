import { MediaInfoResponseDto } from "@common/dtos/media-info.res.dto";
import { UserRole } from "@common/enums";
import { type UUID } from "@common/types";
import { PickType } from "@nestjs/swagger";
import { Exclude, Expose } from "class-transformer";

@Exclude()
export class UserResponseDto {
	@Expose()
	id!: UUID;

	@Expose()
	username!: string;

	@Expose()
	email?: string;

	@Expose()
	emailVerified!: boolean;

	@Expose()
	avatar?: MediaInfoResponseDto;

	@Expose()
	role!: UserRole;

	@Expose()
	createdAt!: Date;

	@Expose()
	updatedAt?: Date;
}

@Exclude()
export class OwnerResponseDto extends PickType(UserResponseDto, [
	"id",
	"username",
	"avatar",
] as const) {}

@Exclude()
export class ActorResponseDto extends OwnerResponseDto {}
