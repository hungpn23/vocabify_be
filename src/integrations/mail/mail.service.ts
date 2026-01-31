import {
	type IntegrationConfig,
	integrationConfig,
	type MailConfig,
	mailConfig,
} from "@config";
import { Inject, Injectable, Logger } from "@nestjs/common";
import { Resend } from "resend";
import { SendWelcomeEmailDto } from "./mail.dto";
import { renderEmail } from "./render-email";
import { WelcomeEmail, WelcomeEmailProps } from "./templates/welcome";

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

	async sendWelcomeEmail({ username, email }: SendWelcomeEmailDto) {
		const { data, error } = await this.resend.emails.send({
			from: this.mailConf.from,
			to: email,
			subject: "Welcome to Vocabify!",
			html: await renderEmail<WelcomeEmailProps>(WelcomeEmail, { username }),
		});

		if (error) return this.logger.error({ error });

		this.logger.debug({ data });
	}
}
