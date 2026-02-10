import { Expose } from "class-transformer";

export class TokenPairResponseDto {
	@Expose()
	accessToken!: string;

	@Expose()
	refreshToken!: string;
}

export class ConfirmEmailVerificationResponseDto {
	@Expose()
	verifiedToken!: string;
}

export class ConfirmPasswordResetResponseDto {
	@Expose()
	resetToken!: string;
}
