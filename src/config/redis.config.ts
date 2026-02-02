import { PortValidator, StringValidatorOptional } from "@common/decorators";
import { ConfigType, registerAs } from "@nestjs/config";
import { ValidateIf } from "class-validator";
import { validateConfig } from "./validate-config";

class RedisEnvVariables {
	@StringValidatorOptional()
	REDIS_CONNECTION_STRING?: string;

	@ValidateIf((obj: RedisEnvVariables) => !obj.REDIS_CONNECTION_STRING)
	@StringValidatorOptional()
	REDIS_HOST?: string;

	/**
	 * @description this field is required for port mapping and exposing in docker compose
	 */
	@PortValidator()
	REDIS_PORT!: number;

	@ValidateIf((obj: RedisEnvVariables) => !obj.REDIS_CONNECTION_STRING)
	@StringValidatorOptional()
	REDIS_USERNAME?: string;

	@ValidateIf((obj: RedisEnvVariables) => !obj.REDIS_CONNECTION_STRING)
	@StringValidatorOptional()
	REDIS_PASSWORD?: string;
}

export const redisConfig = registerAs("redis", () => {
	const config = validateConfig(RedisEnvVariables);

	return {
		connectionString: config.REDIS_CONNECTION_STRING,
		host: config.REDIS_HOST,
		port: config.REDIS_PORT,
		username: config.REDIS_USERNAME,
		password: config.REDIS_PASSWORD,
	};
});

export type RedisConfig = ConfigType<typeof redisConfig>;
