import { type } from "arktype";
import { createArkDto } from "nestjs-arktype";

const passwordSchema = type("string").narrow(
	(s, ctx) =>
		/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!#$%&*@^]).{8,}$/.test(s) ||
		ctx.mustBe(
			"at least 8 characters, including uppercase, lowercase, number, and special characters",
		),
);

const baseAuthSchema = type({
	username: "string >= 1",
	email: "string.email",
	password: passwordSchema,
});

const loginSchema = baseAuthSchema.pick("email", "password");

const signUpSchema = baseAuthSchema.pick("username", "password").merge({
	verifiedToken: "string.uuid.v4",
});

const requestEmailVerificationSchema = baseAuthSchema.pick("email");

const confirmEmailVerificationSchema = baseAuthSchema.pick("email").merge({
	otp: "string == 6",
});

const requestMagicLinkSchema = baseAuthSchema.pick("email");

const changePasswordSchema = type({
	oldPassword: passwordSchema,
	newPassword: passwordSchema,
});

const refreshTokenSchema = type({
	refreshToken: "string >= 1",
});

const requestPasswordResetSchema = baseAuthSchema.pick("email");

const confirmPasswordResetSchema = baseAuthSchema.pick("email").merge({
	otp: "string.numeric == 6",
});

const resetPasswordSchema = type({
	resetToken: "string.uuid.v4",
	newPassword: passwordSchema,
});

export class LoginDto extends createArkDto(loginSchema, {
	name: "LoginDto",
	input: true,
}) {}

export class SignUpDto extends createArkDto(signUpSchema, {
	name: "SignUpDto",
	input: true,
}) {}

export class RequestEmailVerificationDto extends createArkDto(
	requestEmailVerificationSchema,
	{ name: "RequestEmailVerificationDto", input: true },
) {}

export class ConfirmEmailVerificationDto extends createArkDto(
	confirmEmailVerificationSchema,
	{ name: "ConfirmEmailVerificationDto", input: true },
) {}

export class RequestMagicLinkDto extends createArkDto(requestMagicLinkSchema, {
	name: "RequestMagicLinkDto",
	input: true,
}) {}

export class ChangePasswordDto extends createArkDto(changePasswordSchema, {
	name: "ChangePasswordDto",
	input: true,
}) {}

export class RefreshTokenDto extends createArkDto(refreshTokenSchema, {
	name: "RefreshTokenDto",
	input: true,
}) {}

export class RequestPasswordResetDto extends createArkDto(
	requestPasswordResetSchema,
	{ name: "RequestPasswordResetDto", input: true },
) {}

export class ConfirmPasswordResetDto extends createArkDto(
	confirmPasswordResetSchema,
	{ name: "ConfirmPasswordResetDto", input: true },
) {}

export class ResetPasswordDto extends createArkDto(resetPasswordSchema, {
	name: "ResetPasswordDto",
	input: true,
}) {}
