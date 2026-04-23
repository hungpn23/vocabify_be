import { ConfigType, registerAs } from "@nestjs/config";
import { type } from "arktype";
import { validateConfig } from "./validate-config";

const integrationEnvSchema = type({
	IMAGEKIT_PRIVATE_KEY: "string >= 1",
	RESEND_API_KEY: "string >= 1",
});

export const integrationConfig = registerAs("integration", () => {
	const config = validateConfig(integrationEnvSchema);

	return {
		imagekitPrivateKey: config.IMAGEKIT_PRIVATE_KEY,
		resendApiKey: config.RESEND_API_KEY,
	};
});

export type IntegrationConfig = ConfigType<typeof integrationConfig>;
