import { NodeEnv } from "@common/enums";
import { ConfigType, registerAs } from "@nestjs/config";
import { type } from "arktype";
import { validateConfig } from "./validate-config";

const portSchema = type("string.numeric.parse").narrow(
	(n, ctx) =>
		(Number.isInteger(n) && n >= 0 && n <= 65535) ||
		ctx.mustBe("a valid port number (0-65535)"),
);

const appEnvSchema = type({
	NODE_ENV: type.enumerated(...Object.values(NodeEnv)),
	APP_HOST: "string >= 1",
	APP_PORT: portSchema,
	API_PREFIX: "string >= 1",
	FRONTEND_URL: "string >= 1",
});

export const getAppConfig = () => {
	const config = validateConfig(appEnvSchema);

	return {
		nodeEnv: config.NODE_ENV,
		host: config.APP_HOST,
		port: config.APP_PORT,
		apiPrefix: config.API_PREFIX,
		frontendUrl: config.FRONTEND_URL,
	};
};

export const appConfig = registerAs("app", getAppConfig);

export type AppConfig = ConfigType<typeof appConfig>;
