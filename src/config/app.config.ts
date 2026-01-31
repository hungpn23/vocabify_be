import {
	EnumValidator,
	PortValidator,
	StringValidator,
	UrlValidator,
} from "@common/decorators";
import { NodeEnv } from "@common/enums";
import { ConfigType, registerAs } from "@nestjs/config";
import { validateConfig } from "./validate-config";

class AppEnvVariables {
	@EnumValidator(NodeEnv)
	NODE_ENV!: NodeEnv;

	@UrlValidator({ require_tld: false }) // to allow localhost
	APP_HOST!: string;

	@PortValidator()
	APP_PORT!: number;

	@StringValidator()
	API_PREFIX!: string;

	@UrlValidator({ require_tld: false })
	FRONTEND_URL!: string;
}

export const getAppConfig = () => {
	const config = validateConfig(AppEnvVariables);

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
