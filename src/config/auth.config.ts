import { StringValidator } from "@common/decorators";
import { ConfigType, registerAs } from "@nestjs/config";
import { type Algorithm } from "jsonwebtoken";
import ms from "ms";
import { validateConfig } from "./validate-config";

class AuthEnvVariables {
	@StringValidator()
	AUTH_JWT_SECRET!: string;

	@StringValidator()
	AUTH_JWT_EXPIRES_IN!: ms.StringValue;

	@StringValidator()
	AUTH_REFRESH_TOKEN_EXPIRES_IN!: ms.StringValue;

	@StringValidator()
	AUTH_JWT_ALGORITHM!: Algorithm;
}

export const authConfig = registerAs("auth", () => {
	const config = validateConfig(AuthEnvVariables);

	return {
		jwtSecret: config.AUTH_JWT_SECRET,
		jwtExpiresIn: config.AUTH_JWT_EXPIRES_IN,
		refreshTokenExpiresIn: config.AUTH_REFRESH_TOKEN_EXPIRES_IN,
		jwtAlgorithm: config.AUTH_JWT_ALGORITHM,
	};
});

export type AuthConfig = ConfigType<typeof authConfig>;
