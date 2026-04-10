import { SuccessResponseDto } from "@common/dtos";
import { UUID } from "@common/types";
import ImageKit, { toFile } from "@imagekit/nodejs";
import { Inject, Injectable, Logger } from "@nestjs/common";
import { IMAGEKIT_CLIENT } from "./image-kit.const";
import { DeleteFilesResponse, UploadFileOptions } from "./image-kit.type";

@Injectable()
export class ImageKitService {
	private readonly logger = new Logger(ImageKitService.name);

	constructor(
		@Inject(IMAGEKIT_CLIENT) private readonly imageKitClient: ImageKit,
	) {}

	async uploadFile(
		options: UploadFileOptions,
	): Promise<ImageKit.Files.FileUploadResponse> {
		const { userId, file, folders } = options;

		const timestamp = Date.now().toString();
		const uniqueName = `${timestamp}-${file.originalname}`;

		const res = await this.imageKitClient.files.upload({
			file: await toFile(file.buffer),
			fileName: uniqueName,
			folder: this._buildFolderPath(userId, folders),
		});
		return res;
	}

	async deleteFile(fileId: string): Promise<SuccessResponseDto> {
		try {
			await this.imageKitClient.files.delete(fileId);

			return { success: true };
		} catch {
			this.logger.error(`Failed to delete file ${fileId}`);
			return { success: false };
		}
	}

	async deleteFiles(fileIds: string[]): Promise<DeleteFilesResponse> {
		const { successfullyDeletedFileIds } =
			await this.imageKitClient.files.bulk.delete({
				fileIds,
			});

		return {
			success: true,
			successfullyDeletedFileIds,
		};
	}

	async copyFile(
		userId: UUID,
		sourcePath: string,
		folders: string[],
	): Promise<void> {
		await this.imageKitClient.files.copy({
			sourceFilePath: sourcePath,
			destinationPath: this._buildFolderPath(userId, folders),
		});

		// TODO: get fileId here and return it
	}

	private _buildFolderPath(userId: UUID, folders: string[]) {
		return [userId, ...folders].join("/");
	}
}
