import { STATUS_CODES } from "node:http";
import { ErrorResponseDto, PaginatedDto } from "@common/dtos";
import { applyDecorators, HttpCode, HttpStatus, Type } from "@nestjs/common";
import {
	ApiBearerAuth,
	ApiExtraModels,
	ApiOkResponse,
	ApiResponse,
	getSchemaPath,
} from "@nestjs/swagger";
import { ApiPublic } from "./api-public.decorator";
import {
	ArkSerialize,
	type ArkSerializeTarget,
} from "./ark-serialize.decorator";

type EndpointOptions = Partial<{
	responseType: Type<unknown>;
	isPublic: boolean;
	description: string;
	statusCode: HttpStatus;
	errorStatusCodes: HttpStatus[];
	isPaginated: boolean;
}>;

function isArkDto(t: unknown): t is ArkSerializeTarget {
	return (
		typeof t === "function" && (t as { isArkDto?: boolean }).isArkDto === true
	);
}

export function ApiEndpoint(options: EndpointOptions = {}) {
	const {
		responseType,
		isPublic,
		description,
		statusCode = HttpStatus.OK,
		errorStatusCodes,
		isPaginated,
	} = options;

	const decorators: MethodDecorator[] = [];

	if (responseType && isArkDto(responseType)) {
		decorators.push(ArkSerialize(responseType));
	}
	decorators.push(HttpCode(statusCode));
	decorators.push(isPublic ? ApiPublic() : ApiBearerAuth());

	if (responseType) {
		if (isPaginated) {
			decorators.push(ApiPaginatedResponse(responseType));
		} else {
			decorators.push(
				ApiOkResponse({
					type: responseType,
					description,
				}),
			);
		}
	}

	handleErrorResponse(errorStatusCodes, isPublic).forEach((statusCode) => {
		decorators.push(
			ApiResponse({
				type: ErrorResponseDto,
				status: statusCode,
				description: STATUS_CODES[statusCode],
			}),
		);
	});

	return applyDecorators(...decorators);
}

export function ApiEndpointPublic(
	options: Omit<EndpointOptions, "isPublic"> = {},
) {
	return ApiEndpoint({ ...options, isPublic: true });
}

function handleErrorResponse(
	errorStatusCodes?: HttpStatus[],
	isPublic?: boolean,
) {
	const defaultErrorStatusCodes = [
		HttpStatus.BAD_REQUEST,
		HttpStatus.UNAUTHORIZED,
		HttpStatus.UNPROCESSABLE_ENTITY,
		HttpStatus.INTERNAL_SERVER_ERROR,
	];

	if (errorStatusCodes) defaultErrorStatusCodes.push(...errorStatusCodes);

	const uniqueErrorStatusCodes = [...new Set(defaultErrorStatusCodes)];

	if (isPublic)
		return uniqueErrorStatusCodes.filter(
			(code) => code !== HttpStatus.UNAUTHORIZED,
		);

	return uniqueErrorStatusCodes;
}

function ApiPaginatedResponse<DataDto extends Type<unknown>>(
	dataDto: DataDto,
): MethodDecorator {
	// ref: https://aalonso.dev/blog/2021/how-to-generate-generics-dtos-with-nestjsswagger-422g
	return applyDecorators(
		ApiExtraModels(PaginatedDto, dataDto),
		ApiOkResponse({
			schema: {
				allOf: [
					{
						$ref: getSchemaPath(PaginatedDto),
					},
					{
						properties: {
							// override 'data' property of PaginatedDto
							data: {
								type: "array",
								items: { $ref: getSchemaPath(dataDto) },
							},
						},
					},
				],
			},
		}),
	);
}
