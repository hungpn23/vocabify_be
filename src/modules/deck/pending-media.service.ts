import { PendingMedia } from "@db/entities";
import {
	EnsureRequestContext,
	EntityManager,
	EntityRepository,
} from "@mikro-orm/core";
import { InjectRepository } from "@mikro-orm/nestjs";
import { ImageKitService } from "@modules/image-kit/image-kit.service";
import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";

@Injectable()
export class PendingMediaService {
	private readonly logger = new Logger(PendingMediaService.name);

	constructor(
		private readonly em: EntityManager,
		private readonly imageKitService: ImageKitService,
		@InjectRepository(PendingMedia)
		private readonly pendingMediaRepo: EntityRepository<PendingMedia>,
	) {}

	@Cron(CronExpression.EVERY_2_HOURS)
	@EnsureRequestContext()
	async cleanupExpiredPendingMedias() {
		const TwoHoursBefore = new Date(Date.now() - 2 * 60 * 60 * 1000);
		const pendingMedias = await this.pendingMediaRepo.find({
			createdAt: { $lte: TwoHoursBefore },
		});

		if (!pendingMedias.length) return;

		const fileIds = pendingMedias.map(
			(pendingMedia) => pendingMedia.media.fileId,
		);
		const { successfullyDeletedFileIds, success } =
			await this.imageKitService.deleteFiles(fileIds);

		if (successfullyDeletedFileIds?.length) {
			const deletedPM = pendingMedias.filter((pm) =>
				successfullyDeletedFileIds.includes(pm.media.fileId),
			);

			this.em.remove(deletedPM);
			await this.em.flush();
		}

		if (!success)
			this.logger.warn("Some pending media files could not be deleted.");
	}
}
