import { Exclude, Expose } from "class-transformer";

@Exclude()
export class SuccessResponseDto {
	@Expose()
	success!: boolean;
}
