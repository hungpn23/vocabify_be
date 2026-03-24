import { JobName, QueueName } from "@common/enums";
import { UploadImageData } from "@common/types";
import { EntityManager, RequestContext } from "@mikro-orm/core";
import { ImageKitService } from "@modules/image-kit/image-kit.service";
import { OnWorkerEvent, Processor, WorkerHost } from "@nestjs/bullmq";
import { Logger } from "@nestjs/common";
import { Job } from "bullmq";

@Processor(QueueName.IMAGE)
export class UserConsumer extends WorkerHost {
	private readonly logger = new Logger(UserConsumer.name);

	constructor(
		private readonly em: EntityManager,
		private readonly imageKitService: ImageKitService,
	) {
		super();
	}

	async process(job: Job<UploadImageData, void, JobName>) {
		const { data, name } = job;

		await RequestContext.create(this.em, async () => {
			switch (name) {
				case JobName.UPLOAD_USER_AVATAR:
					await this.imageKitService.uploadFile(data.userId, data.file);
					break;
				case JobName.DELETE_USER_AVATAR:
					await this.imageKitService.deleteFile(data.userId);
					break;
			}
		});
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
