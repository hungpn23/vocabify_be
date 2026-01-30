import {
	PasswordValidator,
	StringValidator,
} from "@common/decorators/validators.decorator";
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

export class RefreshTokenDto {
	@StringValidator()
	refreshToken!: string;
}

@Exclude()
export class TokenPairDto {
	@Expose()
	accessToken!: string;

	@Expose()
	refreshToken!: string;
}
