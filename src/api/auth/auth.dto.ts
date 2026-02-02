import {
	EmailValidator,
	PasswordValidator,
	StringValidator,
} from "@common/decorators";
import { PickType } from "@nestjs/swagger";

export class BaseAuthDto {
	@EmailValidator()
	email!: string;

	@PasswordValidator()
	password!: string;
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
