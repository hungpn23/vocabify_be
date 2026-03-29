import { applyDecorators, UseInterceptors } from "@nestjs/common";
import { FileInterceptor, FilesInterceptor } from "@nestjs/platform-express";
import { MulterOptions } from "@nestjs/platform-express/multer/interfaces/multer-options.interface";
import {
	ApiBody,
	ApiConsumes,
	ApiExtraModels,
	getSchemaPath,
} from "@nestjs/swagger";
import {
	ReferenceObject,
	SchemaObject,
} from "@nestjs/swagger/dist/interfaces/open-api-spec.interface";
import { ClassConstructor } from "class-transformer";

export function ApiFile(
	fieldName: string,
	options?: MulterOptions,
): MethodDecorator {
	return applyDecorators(
		UseInterceptors(FileInterceptor(fieldName, options)),
		ApiConsumes("multipart/form-data"),
		ApiBody({
			schema: {
				type: "object",
				properties: {
					[fieldName]: {
						type: "string",
						format: "binary",
					},
				},
				required: [fieldName],
			},
		}),
	);
}

export type ApiFilesOptions<TClass> = {
	fieldName: string;
	maxCount?: number;
	extraModels?: ClassConstructor<TClass>;
	options?: MulterOptions;
};

export function ApiFiles<TClass>(
	options: ApiFilesOptions<TClass>,
): MethodDecorator {
	const { fieldName, maxCount, extraModels, options: multerOptions } = options;

	const decorators = [
		UseInterceptors(FilesInterceptor(fieldName, maxCount, multerOptions)),
		ApiConsumes("multipart/form-data"),
	];

	const schema: SchemaObject | ReferenceObject = {
		allOf: [
			{
				properties: {
					[fieldName]: {
						type: "array",
						items: {
							type: "string",
							format: "binary",
						},
					},
				},
				required: [fieldName],
			},
		],
	};

	if (extraModels) {
		decorators.push(ApiExtraModels(extraModels));

		schema.allOf?.push({
			$ref: getSchemaPath(extraModels),
		});
	}

	return applyDecorators(...decorators);
}
