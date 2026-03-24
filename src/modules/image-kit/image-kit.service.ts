import { createReadStream, unlinkSync } from "node:fs";
import { DeleteImageData, UploadImageData, UUID } from "@common/types";
import { User } from "@db/entities";
import ImageKit from "@imagekit/nodejs";
import { EntityManager, EntityRepository } from "@mikro-orm/core";
import { InjectRepository } from "@mikro-orm/nestjs";
import { Inject, Injectable, Logger } from "@nestjs/common";
import { IMAGEKIT_CLIENT } from "./image-kit.const";

@Injectable()
export class ImageKitService {
	private readonly logger = new Logger(ImageKitService.name);

	constructor(
		private readonly em: EntityManager,
		@Inject(IMAGEKIT_CLIENT) private readonly imageKitClient: ImageKit,
		@InjectRepository(User)
		private readonly userRepository: EntityRepository<User>,
	) {}

	async uploadFile({ userId, file }: UploadImageData) {
		const folder = this._buildFolderPath(userId, file.destination);

		const { url, fileId } = await this.imageKitClient.files.upload({
			file: createReadStream(file.path),
			fileName: file.filename,
			folder,
		});

		const user = await this.userRepository.findOne(userId);
		if (!user) throw new Error(`User not found`);

		if (!url || !fileId) throw new Error("Upload failed");

		user.avatar = { url, fileId, folder };

		unlinkSync(file.path);
		await this.em.flush();

		this.logger.debug(`Uploaded to ImageKit, URL: ${url}`);
	}

	async deleteFile({ userId, fileId }: DeleteImageData) {
		const user = await this.userRepository.findOne({
			id: userId,
			avatar: { fileId },
		});
		if (!user) throw new Error("User not found");

		await this.imageKitClient.files
			.delete(fileId)
			.then(async () => {
				user.avatar = undefined;
				await this.em.flush();
			})
			.catch(() => {
				this.logger.error(`Failed to delete file ${fileId}`);
			});
	}

	private _buildFolderPath(
		userId: UUID,
		destination: string,
		resourceId?: UUID,
	) {
		const subFolder = destination.replace(/^.*uploads\//, "");
		const parts = [userId, subFolder];
		if (resourceId) parts.push(resourceId);
		return parts.join("/");
	}
}
