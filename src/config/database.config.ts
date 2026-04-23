import { ConfigType, registerAs } from "@nestjs/config";
import { type } from "arktype";
import { validateConfig } from "./validate-config";

const portSchema = type("string.numeric.parse").narrow(
	(n, ctx) =>
		(Number.isInteger(n) && n >= 0 && n <= 65535) ||
		ctx.mustBe("a valid port number (0-65535)"),
);

const databaseEnvSchema = type({
	"DB_CONNECTION_STRING?": "string",
	"DB_HOST?": "string",
	"DB_PORT?": portSchema,
	"DB_USER?": "string",
	"DB_PASSWORD?": "string",
	"DB_DATABASE?": "string",
	"DB_SCHEMA?": "string",
}).narrow((env, ctx) => {
	if (env.DB_CONNECTION_STRING) return true;
	const required = [
		"DB_HOST",
		"DB_PORT",
		"DB_USER",
		"DB_PASSWORD",
		"DB_DATABASE",
		"DB_SCHEMA",
	] as const;
	const missing = required.filter((k) => !env[k]);
	if (missing.length > 0)
		return ctx.mustBe(
			`either DB_CONNECTION_STRING set, or all of: ${required.join(", ")}`,
		);
	return true;
});

export const databaseConfig = registerAs("database", () => {
	const config = validateConfig(databaseEnvSchema);

	return config.DB_CONNECTION_STRING
		? {
				clientUrl: config.DB_CONNECTION_STRING,
			}
		: {
				host: config.DB_HOST!,
				port: config.DB_PORT!,
				user: config.DB_USER!,
				password: config.DB_PASSWORD!,
				dbName: config.DB_DATABASE!,
				schema: config.DB_SCHEMA!,
			};
});

export type DatabaseConfig = ConfigType<typeof databaseConfig>;
