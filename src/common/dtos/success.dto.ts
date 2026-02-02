import { Expose } from "class-transformer";

export class SuccessResponseDto {
	@Expose()
	success!: boolean;
}
