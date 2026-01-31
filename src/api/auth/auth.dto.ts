import {
	EmailValidator,
	PasswordValidator,
	StringValidator,
} from "@common/decorators";
import { PickType } from "@nestjs/swagger";
import { Exclude, Expose } from "class-transformer";

class BaseAuthDto {
	@EmailValidator()
	email!: string;

	@PasswordValidator()
	password!: string;
}

export class RequestMagicLinkDto extends PickType(BaseAuthDto, [
	"email",
] as const) {}

export class LoginDto extends BaseAuthDto {}

export class RegisterDto extends BaseAuthDto {}

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

@Exclude()
export class TokenPairDto {
	@Expose()
	accessToken!: string;

	@Expose()
	refreshToken!: string;
}

@Exclude()
export class RefreshTokenResponseDto {
	@Expose()
	accessToken!: string;
}
