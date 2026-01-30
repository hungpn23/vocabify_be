import { Exclude, Expose } from "class-transformer";

@Exclude()
export class ErrorDetailDto {
	@Expose()
	property!: string;

	@Expose()
	constraintName!: string;

	@Expose()
	message!: string;
}

@Exclude()
export class ErrorDto {
	@Expose()
	timestamp!: string;

	@Expose()
	statusCode!: number;

	@Expose()
	statusMessage?: string;

	@Expose()
	message!: string;

	@Expose()
	details?: ErrorDetailDto[] | null;
}
