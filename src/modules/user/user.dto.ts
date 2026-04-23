import { type } from "arktype";
import { createArkDto } from "nestjs-arktype";

const updateProfileSchema = type({
	username: "string >= 1",
});

export class UpdateProfileDto extends createArkDto(updateProfileSchema, {
	name: "UpdateProfileDto",
	input: true,
}) {}
