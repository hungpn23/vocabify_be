import { Exclude, Expose } from "class-transformer";

@Exclude()
export class ErrorDetailResponseDto {
	@Expose()
	property!: string;

	@Expose()
	constraintName!: string;

	@Expose()
	message!: string;
}

@Exclude()
export class ErrorResponseDto {
	@Expose()
	timestamp!: string;

	@Expose()
	statusCode!: number;

	@Expose()
	statusMessage?: string;

	@Expose()
	message!: string;

	@Expose()
	details?: ErrorDetailResponseDto[] | null;
}
