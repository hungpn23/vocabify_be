import { ConfigType, registerAs } from "@nestjs/config";
import { type } from "arktype";
import { validateConfig } from "./validate-config";

const portSchema = type("string.numeric.parse").narrow(
	(n, ctx) =>
		(Number.isInteger(n) && n >= 0 && n <= 65535) ||
		ctx.mustBe("a valid port number (0-65535)"),
);

const boolSchema = type("'true'|'false'|boolean").pipe((v) =>
	typeof v === "boolean" ? v : v === "true",
);

const mailEnvSchema = type({
	"MAIL_HOST?": "string",
	"MAIL_PORT?": portSchema,
	"MAIL_SECURE?": boolSchema,
	"MAIL_AUTH_USER?": "string",
	"MAIL_AUTH_PASS?": "string",
	MAIL_FROM: "string >= 1",
});

export const mailConfig = registerAs("mail", () => {
	const config = validateConfig(mailEnvSchema);

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
