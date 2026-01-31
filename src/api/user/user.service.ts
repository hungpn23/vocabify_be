import { JobName, QueueName } from "@common/enums";
import { ImageUploadData, UUID } from "@common/types";
import { InjectQueue } from "@nestjs/bullmq";
import { Injectable } from "@nestjs/common";
import { Queue } from "bullmq";
import { plainToInstance } from "class-transformer";
import { UploadAvatarDto } from "./user.dto";

@Injectable()
export class UserService {
	constructor(
		@InjectQueue(QueueName.IMAGE)
		private readonly imageQueue: Queue<ImageUploadData, void, JobName>,
	) {}

	async uploadAvatar(userId: UUID, file: Express.Multer.File) {
		await this.imageQueue.add(JobName.UPLOAD_USER_AVATAR, {
			userId,
			filePath: file.path,
			fileName: file.filename,
		});

		return plainToInstance(UploadAvatarDto, {
			status: "Avatar is being processed.",
		});
	}
}
