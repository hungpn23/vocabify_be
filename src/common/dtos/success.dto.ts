import { type } from "arktype";
import { createArkDto } from "nestjs-arktype";

const successResponseSchema = type({
	success: "boolean",
});

export class SuccessResponseDto extends createArkDto(successResponseSchema, {
	name: "SuccessResponseDto",
}) {}
