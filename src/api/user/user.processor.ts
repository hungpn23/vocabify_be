import fs from "node:fs";
import { JobName } from "@common/enums/job-name.enum";
import { QueueName } from "@common/enums/queue-name.enum";
import { ImageUploadData } from "@common/types/jobs.type";
import { User } from "@db/entities/user.entity";
import ImageKit from "@imagekit/nodejs";
import { IMAGEKIT_CLIENT } from "@integrations/imagekit/imagekit.provider-token";
import { EntityManager } from "@mikro-orm/core";
import { OnWorkerEvent, Processor, WorkerHost } from "@nestjs/bullmq";
import { Inject, Logger } from "@nestjs/common";
import { Job } from "bullmq";

@Processor(QueueName.IMAGE)
export class UserProcessor extends WorkerHost {
	private readonly logger = new Logger(UserProcessor.name);

	constructor(
		private readonly em: EntityManager,
		@Inject(IMAGEKIT_CLIENT) private readonly imagekitClient: ImageKit,
	) {
		super();
	}

	async process(job: Job<ImageUploadData, void, JobName>) {
		this.logger.debug(`Processing job ${job.id} of type ${job.name}...`);

		const { userId, filePath, fileName } = job.data;
		const em = this.em.fork();
		const userRepository = em.getRepository(User);

		try {
			if (job.name === JobName.UPLOAD_USER_AVATAR) {
				const uploadResult = await this.imagekitClient.files.upload({
					file: fs.createReadStream(filePath),
					fileName,
					folder: "avatars",
				});

				this.logger.debug(`Uploaded to ImageKit, URL: ${uploadResult.url}`);

				const user = await userRepository.findOne(userId);
				if (!user) throw new Error(`User with ID ${userId} not found`);

				user.avatarUrl = uploadResult.url;
				await em.flush();
				this.logger.debug(`Updated avatar URL for user ${userId} in DB.`);

				fs.unlink(filePath, (err) => {
					if (err) throw err;

					this.logger.debug(`Deleted local file: ${filePath}`);
				});
			}
		} catch (error) {
			this.logger.error(`Failed to process avatar for user ${userId}:`, error);
			throw error;
		}
	}

	@OnWorkerEvent("active")
	onActive(job: Job) {
		this.logger.debug(`Job ${job.id} is now active`);
	}

	@OnWorkerEvent("progress")
	onProgress(job: Job) {
		this.logger.debug(`Job ${job.id} is ${+job.progress}% complete`);
	}

	@OnWorkerEvent("completed")
	onCompleted(job: Job) {
		this.logger.debug(`Job ${job.id} has been completed`);
	}

	@OnWorkerEvent("failed")
	onFailed(job: Job) {
		this.logger.error(
			`Job ${job.id} has failed with reason: ${job.failedReason}`,
		);
		this.logger.error(job.stacktrace);
	}

	@OnWorkerEvent("stalled")
	onStalled(job: Job) {
		this.logger.error(`Job ${job.id} has been stalled`);
	}

	@OnWorkerEvent("error")
	onError(job: Job, error: Error) {
		this.logger.error(`Job ${job.id} has failed with error: ${error.message}`);
	}
}
