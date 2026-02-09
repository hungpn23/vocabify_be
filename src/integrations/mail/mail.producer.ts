import { JobName, QueueName } from "@common/enums";
import { InjectQueue } from "@nestjs/bullmq";
import { Injectable } from "@nestjs/common";
import { Queue } from "bullmq";
import { SendMagicLinkDto, SendOtpDto, SendWelcomeDto } from "./mail.dto";

@Injectable()
export class MailProducer {
	constructor(
		@InjectQueue(QueueName.EMAIL)
		private readonly emailQueue: Queue<unknown, void, JobName>,
	) {}

	async sendWelcomeEmail(payload: SendWelcomeDto) {
		await this.emailQueue.add(JobName.SEND_WELCOME_EMAIL, payload);
	}

	async sendMagicLinkEmail(payload: SendMagicLinkDto) {
		await this.emailQueue.add(JobName.SEND_MAGIC_LINK_EMAIL, payload);
	}

	async sendOtpEmail(payload: SendOtpDto) {
		await this.emailQueue.add(JobName.SEND_OTP_EMAIL, payload);
	}
}
