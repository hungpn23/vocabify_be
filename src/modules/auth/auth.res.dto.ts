import { type } from "arktype";
import { createArkDto } from "nestjs-arktype";

const tokenPairSchema = type({
	accessToken: "string",
	refreshToken: "string",
});

export class TokenPairResponseDto extends createArkDto(tokenPairSchema, {
	name: "TokenPairResponseDto",
}) {}

const confirmEmailVerificationResponseSchema = type({
	verifiedToken: "string",
});

export class ConfirmEmailVerificationResponseDto extends createArkDto(
	confirmEmailVerificationResponseSchema,
	{ name: "ConfirmEmailVerificationResponseDto" },
) {}

const confirmPasswordResetResponseSchema = type({
	resetToken: "string",
});

export class ConfirmPasswordResetResponseDto extends createArkDto(
	confirmPasswordResetResponseSchema,
	{ name: "ConfirmPasswordResetResponseDto" },
) {}
