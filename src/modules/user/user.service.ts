import { SuccessResponseDto } from "@common/dtos";
import { JobName, QueueName } from "@common/enums";
import { ImageQueueDataTypes, UUID } from "@common/types";
import { User } from "@db/entities";
import { EntityManager, EntityRepository } from "@mikro-orm/core";
import { InjectRepository } from "@mikro-orm/nestjs";
import { InjectQueue } from "@nestjs/bullmq";
import { Injectable, NotFoundException } from "@nestjs/common";
import { Queue } from "bullmq";
import { UpdateProfileDto } from "./user.dto";

@Injectable()
export class UserService {
	constructor(
		private readonly em: EntityManager,
		@InjectQueue(QueueName.IMAGE)
		private readonly imageQueue: Queue<ImageQueueDataTypes, void, JobName>,
		@InjectRepository(User)
		private readonly userRepository: EntityRepository<User>,
	) {}

	async uploadAvatar(
		userId: UUID,
		file: Express.Multer.File,
	): Promise<SuccessResponseDto> {
		await this.imageQueue.add(JobName.UPLOAD_USER_AVATAR, { userId, file });
		return { success: true };
	}

	async updateProfile(
		userId: UUID,
		dto: UpdateProfileDto,
	): Promise<SuccessResponseDto> {
		const user = await this.userRepository.findOne(userId);
		if (!user) throw new NotFoundException();

		this.userRepository.assign(user, dto);
		await this.em.flush();

		return { success: true };
	}

	async deleteAvatar(userId: UUID, fileId: string) {
		await this.imageQueue.add(JobName.DELETE_USER_AVATAR, { userId, fileId });
		return { success: true };
	}
}
