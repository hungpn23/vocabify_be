import {
	EmailValidator,
	NumberValidator,
	PasswordValidator,
	StringValidator,
} from "@common/decorators";
import { PickType } from "@nestjs/swagger";

export class BaseAuthDto {
	@StringValidator()
	username!: string;

	@EmailValidator()
	email!: string;

	@PasswordValidator()
	password!: string;
}

export class LoginDto extends PickType(BaseAuthDto, [
	"email",
	"password",
] as const) {}

export class SignUpDto extends PickType(BaseAuthDto, [
	"username",
	"password",
] as const) {
	@StringValidator({ isUUID: true })
	verifiedToken!: string;
}

export class EmailVerificationDto extends PickType(BaseAuthDto, [
	"email",
] as const) {}

export class VerifyEmailDto extends PickType(BaseAuthDto, ["email"] as const) {
	@NumberValidator({ isInt: true, minimum: 100000, maximum: 999999 })
	otp!: number;
}

export class RequestMagicLinkDto extends PickType(BaseAuthDto, [
	"email",
] as const) {}

export class ChangePasswordDto {
	@PasswordValidator()
	oldPassword!: string;

	@PasswordValidator()
	newPassword!: string;
}

export class RefreshTokenDto {
	@StringValidator()
	refreshToken!: string;
}
