import { UserRole } from "@common/enums";
import { type UUID } from "@common/types";
import { PickType } from "@nestjs/swagger";
import { Exclude, Expose } from "class-transformer";

@Exclude()
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

@Exclude()
export class OwnerDto extends PickType(UserDto, [
	"id",
	"username",
	"avatarUrl",
]) {}

@Exclude()
export class ActorDto extends OwnerDto {}

@Exclude()
export class UploadAvatarDto {
	@Expose()
	status!: string;
}
