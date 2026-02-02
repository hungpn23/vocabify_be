import { StringValidator } from "@common/decorators";
import { ConfigType, registerAs } from "@nestjs/config";
import { validateConfig } from "./validate-config";

class IntegrationEnvVariables {
	@StringValidator()
	IMAGEKIT_PRIVATE_KEY!: string;

	@StringValidator()
	RESEND_API_KEY!: string;

	@StringValidator()
	COHERE_API_KEY!: string;
}

export const integrationConfig = registerAs("integration", () => {
	const config = validateConfig(IntegrationEnvVariables);

	return {
		imagekitPrivateKey: config.IMAGEKIT_PRIVATE_KEY,
		resendApiKey: config.RESEND_API_KEY,
		cohereApiKey: config.COHERE_API_KEY,
	};
});

export type IntegrationConfig = ConfigType<typeof integrationConfig>;
