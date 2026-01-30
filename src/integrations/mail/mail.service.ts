import {
	type IntegrationConfig,
	integrationConfig,
	type MailConfig,
	mailConfig,
} from "@config";
import { Inject, Injectable, Logger } from "@nestjs/common";
import { Resend } from "resend";

@Injectable()
export class MailService {
	private readonly logger = new Logger(MailService.name);
	private readonly resend: Resend;

	constructor(
		@Inject(integrationConfig.KEY)
		private readonly integrationConf: IntegrationConfig,
		@Inject(mailConfig.KEY)
		private readonly mailConf: MailConfig,
	) {
		this.resend = new Resend(this.integrationConf.resendApiKey);
	}

	async sendWelcomeEmail() {
		const { data, error } = await this.resend.emails.send({
			from: this.mailConf.from,
			to: ["hungpn23@gmail.com"],
			subject: "Welcome to Vocabify!",
			html: "<strong>Welcome to Vocabify!</strong>",
		});

		if (error) return this.logger.error({ error });

		this.logger.debug({ data });
	}
}
