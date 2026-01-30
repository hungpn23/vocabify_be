import { JobName, QueueName } from "@common/enums";
import { InjectQueue } from "@nestjs/bullmq";
import { Injectable } from "@nestjs/common";
import { Queue } from "bullmq";
import { SendWelcomeEmailDto } from "./mail.dto";

@Injectable()
export class MailProducer {
	constructor(
		@InjectQueue(QueueName.EMAIL)
		private readonly emailQueue: Queue<unknown, void, JobName>,
	) {}

	async sendWelcomeEmail(payload: SendWelcomeEmailDto) {
		await this.emailQueue.add(JobName.SEND_WELCOME_EMAIL, payload);
	}
}
