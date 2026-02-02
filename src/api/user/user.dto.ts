import { UserRole } from "@common/enums";
import { type UUID } from "@common/types";
import { PickType } from "@nestjs/swagger";
import { Expose } from "class-transformer";

export class UserDto {
	@Expose()
	id!: UUID;

	@Expose()
	username!: string;

	@Expose()
	email?: string | null;

	@Expose()
	emailVerified!: boolean;

	@Expose()
	avatarUrl?: string | null;

	@Expose()
	role!: UserRole;

	@Expose()
	createdAt!: Date;

	@Expose()
	updatedAt?: Date | null;
}

export class OwnerDto extends PickType(UserDto, [
	"id",
	"username",
	"avatarUrl",
]) {}

export class ActorDto extends OwnerDto {}

export class UploadAvatarDto {
	@Expose()
	status!: string;
}
