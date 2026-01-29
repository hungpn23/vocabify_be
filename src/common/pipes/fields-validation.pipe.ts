import {
	HttpStatus,
	UnprocessableEntityException,
	ValidationPipe,
} from "@nestjs/common";
import { ValidationError } from "class-validator";

export class FieldsValidationPipe extends ValidationPipe {
	constructor() {
		super({
			transform: true,
			whitelist: true,
			errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
			exceptionFactory: (errors: ValidationError[]) => {
				return new UnprocessableEntityException(errors);
			},
		});
	}
}
