import { ArkErrors, type Type } from "arktype";

export function validateConfig<T extends Type>(
	arkSchema: T,
	config: Record<string, unknown> = process.env,
): T["infer"] {
	const result = arkSchema(config);

	if (result instanceof ArkErrors) {
		throw new Error(`Invalid environment configuration:\n${result.summary}`);
	}

	return result;
}
