import { SuccessResponseDto } from "@common/dtos";
import { UUID } from "@common/types";
import ImageKit from "@imagekit/nodejs";

export type UploadFileOptions = {
	userId: UUID;
	file: Express.Multer.File;
	folders: string[];
};

export type DeleteFilesResponse = SuccessResponseDto &
	ImageKit.Files.BulkDeleteResponse;
