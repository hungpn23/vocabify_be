import {
	type IntegrationConfig,
	integrationConfig,
	type MailConfig,
	mailConfig,
} from "@config";
import { Inject, Injectable, Logger } from "@nestjs/common";
import { Resend } from "resend";
import { SendMagicLinkEmailDto, SendWelcomeEmailDto } from "./mail.dto";
import { renderEmail } from "./render-email";
import { MagicLinkEmail, MagicLinkEmailProps } from "./templates/magic-link";
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

	async sendWelcomeEmail({ username, to }: SendWelcomeEmailDto) {
		const { data, error } = await this.resend.emails.send({
			from: this.mailConf.from,
			to,
			subject: "Welcome to Vocabify!",
			html: await renderEmail<WelcomeEmailProps>(WelcomeEmail, { username }),
		});

		if (error) return this.logger.error({ error });

		this.logger.debug({ data });
	}

	async sendMagicLinkEmail({ to, magicLink }: SendMagicLinkEmailDto) {
		const { data, error } = await this.resend.emails.send({
			from: this.mailConf.from,
			to,
			subject: "Login to Vocabify with magic link",
			html: await renderEmail<MagicLinkEmailProps>(MagicLinkEmail, {
				magicLink,
			}),
		});

		if (error) return this.logger.error({ error });

		this.logger.debug({ data });
	}
}
