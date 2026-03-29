import { SuccessResponseDto } from "@common/dtos";
import { UUID } from "@common/types";
import { User } from "@db/entities";
import { EntityManager, EntityRepository } from "@mikro-orm/core";
import { InjectRepository } from "@mikro-orm/nestjs";
import { ImageKitService } from "@modules/image-kit/image-kit.service";
import {
	BadRequestException,
	Injectable,
	Logger,
	NotFoundException,
} from "@nestjs/common";
import { UpdateProfileDto } from "./user.dto";

@Injectable()
export class UserService {
	private readonly logger = new Logger(UserService.name);

	constructor(
		private readonly em: EntityManager,
		private readonly imageKitService: ImageKitService,
		@InjectRepository(User)
		private readonly userRepository: EntityRepository<User>,
	) {}

	async uploadAvatar(
		userId: UUID,
		file: Express.Multer.File,
	): Promise<SuccessResponseDto> {
		const user = await this.userRepository.findOne(userId);
		if (!user) throw new BadRequestException();

		const { url, fileId } = await this.imageKitService.uploadFile({
			userId,
			file,
			folders: ["avatars"],
		});
		if (!url || !fileId) throw new BadRequestException();

		const oldAvatar = user.avatar;
		user.avatar = { url, fileId };
		await this.em.flush();

		if (oldAvatar) {
			const result = await this.imageKitService.deleteFile(oldAvatar.fileId);

			if (!result.success) {
				this.logger.error(`Failed to delete old avatar: ${oldAvatar.fileId}`);
			}
		}

		return { success: true };
	}

	async updateProfile(
		userId: UUID,
		dto: UpdateProfileDto,
	): Promise<SuccessResponseDto> {
		const user = await this.userRepository.findOne(userId);
		if (!user) throw new NotFoundException();

		const existing = await this.userRepository.findOne({
			username: dto.username,
		});
		if (existing) throw new BadRequestException("Username already exists");

		this.userRepository.assign(user, dto);
		await this.em.flush();

		return { success: true };
	}

	async deleteAvatar(userId: UUID, fileId: string) {
		const user = await this.userRepository.findOne({
			id: userId,
			avatar: { fileId },
		});
		if (!user) throw new BadRequestException();

		const result = await this.imageKitService.deleteFile(fileId);

		if (!result.success)
			throw new BadRequestException("Failed to delete avatar");

		user.avatar = undefined;
		await this.em.flush();

		return { success: true };
	}
}
