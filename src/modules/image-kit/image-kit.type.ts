import { UUID } from "@common/types";

export type UploadFileOptions = {
	userId: UUID;
	file: Express.Multer.File;
	folders: string[];
};
