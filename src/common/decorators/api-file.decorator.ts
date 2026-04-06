import { applyDecorators, UseInterceptors } from "@nestjs/common";
import { FileInterceptor, FilesInterceptor } from "@nestjs/platform-express";
import { MulterOptions } from "@nestjs/platform-express/multer/interfaces/multer-options.interface";
import {
	ApiBody,
	ApiConsumes,
	ApiExtraModels,
	getSchemaPath,
} from "@nestjs/swagger";
import { SchemaObject } from "@nestjs/swagger/dist/interfaces/open-api-spec.interface";
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

export type ApiFilesOptions = {
	fieldName: string;
	maxCount?: number;
	extraModel?: ClassConstructor<object>;
	multerOptions?: MulterOptions;
};

export function ApiFiles(options: ApiFilesOptions): MethodDecorator {
	const { fieldName, maxCount, extraModel, multerOptions } = options;

	const decorators: Parameters<typeof applyDecorators> = [
		UseInterceptors(FilesInterceptor(fieldName, maxCount, multerOptions)),
		ApiConsumes("multipart/form-data"),
	];

	const fileSchema: SchemaObject = {
		type: "object",
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
	};

	if (extraModel) {
		decorators.push(ApiExtraModels(extraModel));
		decorators.push(
			ApiBody({
				schema: {
					allOf: [
						fileSchema,
						{
							$ref: getSchemaPath(extraModel),
						},
					],
				},
			}),
		);
	} else {
		decorators.push(
			ApiBody({
				schema: fileSchema,
			}),
		);
	}

	return applyDecorators(...decorators);
}
