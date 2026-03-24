import { JobName, QueueName } from "@common/enums";
import { OnWorkerEvent, Processor, WorkerHost } from "@nestjs/bullmq";
import { Logger } from "@nestjs/common";
import { Job } from "bullmq";
import { SendMagicLinkDto, SendOtpDto, SendWelcomeDto } from "./mail.dto";
import { MailService } from "./mail.service";

@Processor(QueueName.EMAIL)
export class MailConsumer extends WorkerHost {
	private readonly logger = new Logger(MailConsumer.name);

	constructor(private readonly mailService: MailService) {
		super();
	}

	async process(job: Job<unknown, void, JobName>) {
		this.logger.debug(`Processing job ${job.id} of type ${job.name}...`);

		const { name, data } = job;

		switch (name) {
			case JobName.SEND_WELCOME_EMAIL:
				await this.mailService.sendWelcomeEmail(data as SendWelcomeDto);
				break;
			case JobName.SEND_MAGIC_LINK_EMAIL:
				await this.mailService.sendMagicLinkEmail(data as SendMagicLinkDto);
				break;
			case JobName.SEND_OTP_EMAIL:
				await this.mailService.sendOtpEmail(data as SendOtpDto);
				break;
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
