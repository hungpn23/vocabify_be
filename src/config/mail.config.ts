import {
	BooleanValidatorOptional,
	PortValidatorOptional,
	StringValidator,
	StringValidatorOptional,
} from "@common/decorators";
import { ConfigType, registerAs } from "@nestjs/config";
import { validateConfig } from "./validate-config";

class MailEnvVariables {
	@StringValidatorOptional()
	MAIL_HOST?: string;

	@PortValidatorOptional()
	MAIL_PORT?: number;

	@BooleanValidatorOptional()
	MAIL_SECURE?: boolean;

	@StringValidatorOptional()
	MAIL_AUTH_USER?: string;

	@StringValidatorOptional()
	MAIL_AUTH_PASS?: string;

	@StringValidator()
	MAIL_FROM!: string;
}

export const mailConfig = registerAs("mail", () => {
	const config = validateConfig(MailEnvVariables);

	return {
		host: config.MAIL_HOST,
		port: config.MAIL_PORT,
		secure: config.MAIL_SECURE,
		user: config.MAIL_AUTH_USER,
		pass: config.MAIL_AUTH_PASS,
		from: config.MAIL_FROM,
	};
});

export type MailConfig = ConfigType<typeof mailConfig>;
