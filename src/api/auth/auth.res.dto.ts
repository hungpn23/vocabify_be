import { Expose } from "class-transformer";

export class TokenPairResponseDto {
	@Expose()
	accessToken!: string;

	@Expose()
	refreshToken!: string;
}
