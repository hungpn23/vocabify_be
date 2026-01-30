import { StringValidator } from "@common/decorators/validators.decorator";
import { ConfigType, registerAs } from "@nestjs/config";
import { validateConfig } from "./validate-config";

class GoogleEnvVariables {
	@StringValidator()
	GOOGLE_CLIENT_ID!: string;

	@StringValidator()
	GOOGLE_CLIENT_SECRET!: string;

	@StringValidator()
	GOOGLE_REDIRECT_URI!: string;
}

export const googleConfig = registerAs("google", () => {
	const config = validateConfig(GoogleEnvVariables);

	return {
		clientId: config.GOOGLE_CLIENT_ID,
		clientSecret: config.GOOGLE_CLIENT_SECRET,
		redirectUri: config.GOOGLE_REDIRECT_URI,
	};
});

export type GoogleConfig = ConfigType<typeof googleConfig>;
