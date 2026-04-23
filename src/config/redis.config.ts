import { ConfigType, registerAs } from "@nestjs/config";
import { type } from "arktype";
import { validateConfig } from "./validate-config";

const portSchema = type("string.numeric.parse").narrow(
	(n, ctx) =>
		(Number.isInteger(n) && n >= 0 && n <= 65535) ||
		ctx.mustBe("a valid port number (0-65535)"),
);

const redisEnvSchema = type({
	"REDIS_CONNECTION_STRING?": "string",
	"REDIS_HOST?": "string",
	"REDIS_PORT?": portSchema,
	"REDIS_USERNAME?": "string",
	"REDIS_PASSWORD?": "string",
}).narrow((env, ctx) => {
	if (env.REDIS_CONNECTION_STRING) return true;
	const required = [
		"REDIS_HOST",
		"REDIS_PORT",
		"REDIS_USERNAME",
		"REDIS_PASSWORD",
	] as const;
	const missing = required.filter((k) => !env[k]);
	if (missing.length > 0)
		return ctx.mustBe(
			`either REDIS_CONNECTION_STRING set, or all of: ${required.join(", ")}`,
		);
	return true;
});

/**
 * @description this project always require REDIS_CONNECTION_STRING to run correctly
 */
export const redisConfig = registerAs("redis", () => {
	const config = validateConfig(redisEnvSchema);

	return config.REDIS_CONNECTION_STRING
		? {
				connectionString: config.REDIS_CONNECTION_STRING,
			}
		: {
				host: config.REDIS_HOST!,
				port: config.REDIS_PORT!,
				username: config.REDIS_USERNAME!,
				password: config.REDIS_PASSWORD!,
			};
});

export type RedisConfig = ConfigType<typeof redisConfig>;
