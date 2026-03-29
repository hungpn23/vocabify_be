import { SuccessResponseDto } from "@common/dtos";
import { UUID } from "@common/types";
import ImageKit, { toFile } from "@imagekit/nodejs";
import { Inject, Injectable, Logger } from "@nestjs/common";
import { IMAGEKIT_CLIENT } from "./image-kit.const";
import { UploadFileOptions } from "./image-kit.type";

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

		return await this.imageKitClient.files.upload({
			file: await toFile(file.buffer),
			fileName: uniqueName,
			folder: this._buildFolderPath(userId, folders),
		});
	}

	async deleteFile(fileId: string): Promise<SuccessResponseDto> {
		await this.imageKitClient.files.delete(fileId).catch(() => {
			this.logger.error(`Failed to delete file ${fileId}`);
			return { success: false };
		});

		return { success: true };
	}

	private _buildFolderPath(userId: UUID, folders: string[]) {
		return [userId, ...folders].join("/");
	}
}
