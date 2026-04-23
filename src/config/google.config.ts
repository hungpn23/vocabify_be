import { ConfigType, registerAs } from "@nestjs/config";
import { type } from "arktype";
import { validateConfig } from "./validate-config";

const googleEnvSchema = type({
	GOOGLE_CLIENT_ID: "string >= 1",
	GOOGLE_CLIENT_SECRET: "string >= 1",
	GOOGLE_REDIRECT_URI: "string >= 1",
});

export const googleConfig = registerAs("google", () => {
	const config = validateConfig(googleEnvSchema);

	return {
		clientId: config.GOOGLE_CLIENT_ID,
		clientSecret: config.GOOGLE_CLIENT_SECRET,
		redirectUri: config.GOOGLE_REDIRECT_URI,
	};
});

export type GoogleConfig = ConfigType<typeof googleConfig>;
