import { Exclude, Expose } from "class-transformer";

@Exclude()
export class MediaInfoResponseDto {
	@Expose()
	url!: string;

	@Expose()
	fileId!: string;
}
