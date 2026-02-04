import {
	PortValidatorOptional,
	StringValidatorOptional,
} from "@common/decorators";
import { ConfigType, registerAs } from "@nestjs/config";
import { ValidateIf } from "class-validator";
import { validateConfig } from "./validate-config";

class DatabaseEnvVariables {
	@StringValidatorOptional()
	DB_CONNECTION_STRING?: string;

	@ValidateIf((obj: DatabaseEnvVariables) => !obj.DB_CONNECTION_STRING)
	@StringValidatorOptional()
	DB_HOST?: string;

	@ValidateIf((obj: DatabaseEnvVariables) => !obj.DB_CONNECTION_STRING)
	@PortValidatorOptional()
	DB_PORT?: number;

	@ValidateIf((obj: DatabaseEnvVariables) => !obj.DB_CONNECTION_STRING)
	@StringValidatorOptional()
	DB_USER?: string;

	@ValidateIf((obj: DatabaseEnvVariables) => !obj.DB_CONNECTION_STRING)
	@StringValidatorOptional()
	DB_PASSWORD?: string;

	@ValidateIf((obj: DatabaseEnvVariables) => !obj.DB_CONNECTION_STRING)
	@StringValidatorOptional()
	DB_DATABASE?: string;

	@ValidateIf((obj: DatabaseEnvVariables) => !obj.DB_CONNECTION_STRING)
	@StringValidatorOptional()
	DB_SCHEMA?: string;
}

export const databaseConfig = registerAs("database", () => {
	const config = validateConfig(DatabaseEnvVariables);

	return {
		clientUrl: config.DB_CONNECTION_STRING,
		host: config.DB_HOST,
		port: config.DB_PORT,
		user: config.DB_USER,
		password: config.DB_PASSWORD,
		dbName: config.DB_DATABASE,
		schema: config.DB_SCHEMA,
	};
});

export type DatabaseConfig = ConfigType<typeof databaseConfig>;
