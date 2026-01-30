import { PasswordValidator, StringValidator } from "@common";
import { PickType } from "@nestjs/swagger";
import { Exclude, Expose } from "class-transformer";

class BaseAuthDto {
	@StringValidator({ minLength: 6, maxLength: 20 })
	username!: string;

	@PasswordValidator()
	password!: string;
}

export class LoginDto extends BaseAuthDto {}

export class RegisterDto extends BaseAuthDto {}

export class ChangePasswordDto {
	@PasswordValidator()
	oldPassword!: string;

	@PasswordValidator()
	newPassword!: string;
}

export class ExchangeTokenDto {
	@StringValidator()
	code!: string;
}

@Exclude()
export class TokenPairDto {
	@Expose()
	accessToken!: string;

	@Expose()
	refreshToken!: string;
}

export class RefreshTokenDto extends PickType(TokenPairDto, [
	"refreshToken",
] as const) {}
