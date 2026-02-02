import { StringValidator } from "@common/decorators/validators.decorator";
import { ConfigType, registerAs } from "@nestjs/config";
import { validateConfig } from "./validate-config";

class VectorDbEnvVariables {
	@StringValidator()
	VECTOR_DB_HOST!: string;

	@StringValidator()
	VECTOR_DB_PORT!: string;

	@StringValidator()
	VECTOR_DB_COLLECTION_NAME!: string;
}

export const vectorDbConfig = registerAs("vector-db", () => {
	const config = validateConfig(VectorDbEnvVariables);

	return {
		host: config.VECTOR_DB_HOST,
		port: config.VECTOR_DB_PORT,
		collectionName: config.VECTOR_DB_COLLECTION_NAME,
	};
});

export type VectorDbConfig = ConfigType<typeof vectorDbConfig>;
