import { ClassConstructor, plainToInstance } from "class-transformer";
import { validateSync } from "class-validator";

export function validateConfig<T extends object>(
	envVariablesClass: ClassConstructor<T>,
	config: Record<string, unknown> = process.env,
): T {
	const transformed = plainToInstance(envVariablesClass, config);

	const errors = validateSync(transformed, {
		whitelist: true,
		enableDebugMessages: true,
	});

	if (errors.length > 0) throw new Error(errors.toString());

	return transformed;
}
