import { createReadStream, unlinkSync } from "node:fs";
import { UUID } from "@common/types";
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

	async uploadFile(userId: UUID, file: Express.Multer.File) {
		const uploadResult = await this.imageKitClient.files.upload({
			file: createReadStream(file.path),
			fileName: file.filename,
			folder: this._buildFolderPath(userId, file.destination),
		});

		const user = await this.userRepository.findOne(userId);
		if (!user) throw new Error(`User with ID ${userId} not found`);

		user.avatarUrl = uploadResult.url;

		unlinkSync(file.path);
		await this.em.flush();

		this.logger.debug(`Uploaded to ImageKit, URL: ${uploadResult.url}`);
	}

	async deleteFile(userId: UUID) {
		await this.imageKitClient.files.delete("fileId");
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
