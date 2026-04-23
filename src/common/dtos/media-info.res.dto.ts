import { type } from "arktype";
import { createArkDto } from "nestjs-arktype";

export const mediaInfoResponseSchema = type({
	url: "string",
	fileId: "string",
	filePath: "string",
});

export class MediaInfoResponseDto extends createArkDto(
	mediaInfoResponseSchema,
	{
		name: "MediaInfoResponseDto",
	},
) {}
