import { type } from "arktype";
import { createArkDto } from "nestjs-arktype";

const errorDetailSchema = type({
	property: "string",
	constraintName: "string",
	message: "string",
});

export class ErrorDetailResponseDto extends createArkDto(errorDetailSchema, {
	name: "ErrorDetailResponseDto",
}) {}

const errorResponseSchema = type({
	timestamp: "string",
	statusCode: "number",
	"statusMessage?": "string",
	message: "string",
	"details?": errorDetailSchema.array(),
});

export class ErrorResponseDto extends createArkDto(errorResponseSchema, {
	name: "ErrorResponseDto",
}) {}
