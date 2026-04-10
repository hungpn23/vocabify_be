import { HttpStatus, ParseFilePipeBuilder } from "@nestjs/common";
import { OptionalValidateFileOptions } from "./validate-file.pipe";

export function validateImagePipe(options: OptionalValidateFileOptions = {}) {
	return new ParseFilePipeBuilder()
		.addFileTypeValidator({
			fileType: "image/(png|jpg|jpeg|webp)",
			skipMagicNumbersValidation: true, // temporarily enable for avoid the bug: https://github.com/nestjs/nest/issues/14970
			...options,
		})
		.addMaxSizeValidator({ maxSize: 5 * 1024 * 1024, ...options })
		.build({
			errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
			...options,
		});
}
