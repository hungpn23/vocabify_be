import { Logger } from "@nestjs/common";
import { ClassConstructor, plainToInstance } from "class-transformer";
import { validate } from "class-validator";

export async function transformAndValidate<T extends object>(
	plain: unknown,
	dto: ClassConstructor<T>,
): Promise<T | undefined> {
	const logger = new Logger(transformAndValidate.name);
	const instance = plainToInstance(dto, plain);

	const errors = await validate(instance);

	if (errors.length > 0) {
		logger.error("Validation failed:", errors.toString());

		return undefined;
	} else {
		logger.debug(
			"Validation successful, is instance of class:",
			instance instanceof dto,
		);

		return instance;
	}
}
