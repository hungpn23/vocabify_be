import { ConfigType, registerAs } from "@nestjs/config";
import { type } from "arktype";
import { type Algorithm } from "jsonwebtoken";
import ms from "ms";
import { validateConfig } from "./validate-config";

const authEnvSchema = type({
	AUTH_JWT_SECRET: "string >= 1",
	AUTH_JWT_EXPIRES_IN: "string >= 1",
	AUTH_REFRESH_TOKEN_EXPIRES_IN: "string >= 1",
	AUTH_JWT_ALGORITHM: "string >= 1",
});

export const authConfig = registerAs("auth", () => {
	const config = validateConfig(authEnvSchema);

	return {
		jwtSecret: config.AUTH_JWT_SECRET,
		jwtExpiresIn: config.AUTH_JWT_EXPIRES_IN as ms.StringValue,
		refreshTokenExpiresIn:
			config.AUTH_REFRESH_TOKEN_EXPIRES_IN as ms.StringValue,
		jwtAlgorithm: config.AUTH_JWT_ALGORITHM as Algorithm,
	};
});

export type AuthConfig = ConfigType<typeof authConfig>;
