import { UUID } from "./branded.type";

export type ImageQueueDataTypes = UploadImageData | DeleteImageData;

export type UploadImageData = {
	userId: UUID;
	file: Express.Multer.File;
};

export type DeleteImageData = {
	userId: UUID;
};

export type UpdateUserStatsData = {
	userId: UUID;
	learnedCount: number;
};
