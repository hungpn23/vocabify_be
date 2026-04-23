import { mediaInfoResponseSchema } from "@common/dtos/media-info.res.dto";
import { UserRole } from "@common/enums";
import { type } from "arktype";
import { createArkDto } from "nestjs-arktype";

export const userResponseSchema = type({
	id: "string.uuid",
	username: "string",
	"email?": "string",
	emailVerified: "boolean",
	"avatar?": mediaInfoResponseSchema,
	role: type.enumerated(...Object.values(UserRole)),
	createdAt: "Date",
	"updatedAt?": "Date",
});

export class UserResponseDto extends createArkDto(userResponseSchema, {
	name: "UserResponseDto",
}) {}

export const ownerResponseSchema = userResponseSchema.pick(
	"id",
	"username",
	"avatar",
);

export class OwnerResponseDto extends createArkDto(ownerResponseSchema, {
	name: "OwnerResponseDto",
}) {}

export const actorResponseSchema = ownerResponseSchema;

export class ActorResponseDto extends createArkDto(actorResponseSchema, {
	name: "ActorResponseDto",
}) {}
