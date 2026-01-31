import { PortValidator, StringValidator } from "@common/decorators";
import { ConfigType, registerAs } from "@nestjs/config";
import { validateConfig } from "./validate-config";

class DatabaseEnvVariables {
	@StringValidator()
	DB_HOST!: string;

	@PortValidator()
	DB_PORT!: number;

	@StringValidator()
	DB_USER!: string;

	@StringValidator()
	DB_PASSWORD!: string;

	@StringValidator()
	DB_DATABASE!: string;
}

export const databaseConfig = registerAs("database", () => {
	const config = validateConfig(DatabaseEnvVariables);

	return {
		host: config.DB_HOST,
		port: config.DB_PORT,
		user: config.DB_USER,
		password: config.DB_PASSWORD,
		dbName: config.DB_DATABASE,
	};
});

export type DatabaseConfig = ConfigType<typeof databaseConfig>;
