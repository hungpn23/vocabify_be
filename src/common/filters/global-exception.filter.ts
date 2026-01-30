import { STATUS_CODES } from "node:http";
import { ErrorDetailDto, ErrorDto } from "@common/dtos/error.dto";
import { UniqueConstraintViolationException } from "@mikro-orm/postgresql";
import {
	ArgumentsHost,
	Catch,
	ExceptionFilter,
	HttpException,
	HttpStatus,
	UnprocessableEntityException,
} from "@nestjs/common";
import { ValidationError } from "class-validator";
import { Response } from "express";

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
	catch(exception: unknown, host: ArgumentsHost): void {
		const ctx = host.switchToHttp();
		const response: Response = ctx.getResponse();

		let error: ErrorDto;

		if (exception instanceof UnprocessableEntityException) {
			// this exception is thrown from main.ts (ValidationPipe)
			error = this._handleUnprocessableEntityException(exception);
		} else if (exception instanceof HttpException) {
			error = this._handleHttpException(exception);
		} else if (exception instanceof UniqueConstraintViolationException) {
			error = this._handleUniqueConstraintException(exception);
		} else {
			error = this._handleUnknownError(exception);
		}

		response.status(error.statusCode).json(error);
	}

	private _handleUnprocessableEntityException(
		exception: UnprocessableEntityException,
	) {
		const response = exception.getResponse() as { message: ValidationError[] };
		const statusCode = exception.getStatus();

		const errorResponse = {
			timestamp: new Date().toISOString(),
			statusCode,
			message: "Validation failed",
			details: this._handleValidationErrors(response.message),
		};

		return errorResponse satisfies ErrorDto;
	}

	private _handleHttpException(exception: HttpException) {
		const statusCode = exception.getStatus();

		return {
			timestamp: new Date().toISOString(),
			statusCode,
			statusMessage: STATUS_CODES[statusCode],
			message: exception.message,
		} satisfies ErrorDto;
	}

	private _handleUniqueConstraintException(
		exception: UniqueConstraintViolationException,
	) {
		const statusCode = HttpStatus.CONFLICT;

		return {
			timestamp: new Date().toISOString(),
			statusCode,
			statusMessage: STATUS_CODES[statusCode],
			message: JSON.stringify(exception.name),
		} satisfies ErrorDto;
	}

	private _handleUnknownError(error: unknown) {
		const err = error instanceof Error ? error : new Error(String(error));
		const statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
		const statusMessage = STATUS_CODES[statusCode] || "Internal Server Error";

		return {
			timestamp: new Date().toISOString(),
			statusCode,
			statusMessage,
			message: err.message || statusMessage,
		} satisfies ErrorDto;
	}

	// ref: https://www.yasint.dev/flatten-error-constraints
	private _handleValidationErrors(errors: ValidationError[]) {
		const results: ErrorDetailDto[] = [];
		for (const error of errors) {
			this._flattenError(error, results);
		}
		return results;
	}

	private _flattenError(
		error: ValidationError,
		results: ErrorDetailDto[],
		parentPath?: string,
	) {
		const propertyPath = parentPath
			? `${parentPath}.${error.property}`
			: error.property;

		if (error.constraints) {
			for (const [constraintName, message] of Object.entries(
				error.constraints,
			)) {
				results.push({
					property: propertyPath,
					constraintName,
					message,
				});
			}
		}

		if (error.children && error.children.length > 0) {
			for (const child of error.children) {
				this._flattenError(child, results, propertyPath);
			}
		}
	}
}
