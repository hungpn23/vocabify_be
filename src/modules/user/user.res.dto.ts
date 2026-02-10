import { UserRole } from "@common/enums";
import { type UUID } from "@common/types";
import { Exclude, Expose } from "class-transformer";

@Exclude()
export class UserResponseDto {
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
export class OwnerResponseDto {
	@Expose()
	id!: UUID;

	@Expose()
	username!: string;

	@Expose()
	avatarUrl?: string | null;
}

@Exclude()
export class ActorResponseDto extends OwnerResponseDto {}

@Exclude()
export class UploadAvatarResponseDto {
	@Expose()
	status!: string;
}
