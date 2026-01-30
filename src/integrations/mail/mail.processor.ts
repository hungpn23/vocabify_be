import { JobName, QueueName } from "@common/enums/background.enum";
import { OnWorkerEvent, Processor, WorkerHost } from "@nestjs/bullmq";
import { Logger } from "@nestjs/common";
import { Job } from "bullmq";
import { MailService } from "./mail.service";

@Processor(QueueName.EMAIL)
export class MailProcessor extends WorkerHost {
	private readonly logger = new Logger(MailProcessor.name);

	constructor(private readonly mailService: MailService) {
		super();
	}

	async process(job: Job<void, void, JobName>) {
		this.logger.debug(`Processing job ${job.id} of type ${job.name}...`);

		try {
			if (job.name === JobName.SEND_WELCOME_EMAIL) {
				await this.mailService.sendWelcomeEmail();

				this.logger.debug(
					`Successfully processed welcome email for job ${job.id}.`,
				);
			}
		} catch (error) {
			this.logger.error(
				`Failed to process welcome email for job ${job.id}:`,
				error,
			);

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
