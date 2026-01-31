import { JobName, QueueName } from "@common/enums";
import { OnWorkerEvent, Processor, WorkerHost } from "@nestjs/bullmq";
import { Logger } from "@nestjs/common";
import { Job } from "bullmq";
import { SendMagicLinkEmailDto, SendWelcomeEmailDto } from "./mail.dto";
import { MailService } from "./mail.service";

@Processor(QueueName.EMAIL)
export class MailProcessor extends WorkerHost {
	private readonly logger = new Logger(MailProcessor.name);

	constructor(private readonly mailService: MailService) {
		super();
	}

	async process(job: Job<unknown, void, JobName>) {
		this.logger.debug(`Processing job ${job.id} of type ${job.name}...`);

		if (job.name === JobName.SEND_WELCOME_EMAIL) {
			await this.mailService.sendWelcomeEmail(job.data as SendWelcomeEmailDto);
		} else if (job.name === JobName.SEND_MAGIC_LINK_EMAIL) {
			await this.mailService.sendMagicLinkEmail(
				job.data as SendMagicLinkEmailDto,
			);
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
