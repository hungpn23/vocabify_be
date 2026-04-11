import {
	type IntegrationConfig,
	integrationConfig,
	type MailConfig,
	mailConfig,
} from "@config";
import { Inject, Injectable, Logger } from "@nestjs/common";
import { Resend } from "resend";
import { SendMagicLinkDto, SendOtpDto, SendWelcomeDto } from "./mail.dto";
import { renderEmail } from "./render-email";
import {
	MagicLinkEmail,
	MagicLinkEmailProps,
	OtpEmail,
	OtpEmailProps,
	WelcomeEmail,
	WelcomeEmailProps,
} from "./templates";

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

	async sendWelcomeEmail({ username, to }: SendWelcomeDto) {
		const { data, error } = await this.resend.emails.send({
			from: this.mailConf.from,
			to,
			subject: "Welcome to the application",
			html: await renderEmail<WelcomeEmailProps>(WelcomeEmail, { username }),
		});

		if (error) return this.logger.error({ error });

		this.logger.debug({ data });
	}

	async sendMagicLinkEmail({ to, magicLink }: SendMagicLinkDto) {
		const { data, error } = await this.resend.emails.send({
			from: this.mailConf.from,
			to,
			subject: "Use this magic link to sign in",
			html: await renderEmail<MagicLinkEmailProps>(MagicLinkEmail, {
				link: magicLink,
			}),
		});

		if (error) return this.logger.error({ error });

		this.logger.debug({ data });
	}

	async sendOtpEmail({ to, otp }: SendOtpDto) {
		const { data, error } = await this.resend.emails.send({
			from: this.mailConf.from,
			to,
			subject: "Verify your email address",
			html: await renderEmail<OtpEmailProps>(OtpEmail, {
				otp,
			}),
		});

		if (error) return this.logger.error({ error });

		this.logger.debug({ data });
	}
}
