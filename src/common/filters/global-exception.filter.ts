import { STATUS_CODES } from "node:http";
import { ErrorDetailResponseDto, ErrorResponseDto } from "@common/dtos";
import { UniqueConstraintViolationException } from "@mikro-orm/postgresql";
import {
	ArgumentsHost,
	Catch,
	ExceptionFilter,
	HttpException,
	HttpStatus,
	UnprocessableEntityException,
} from "@nestjs/common";
import { plainToInstance } from "class-transformer";
import { ValidationError } from "class-validator";
import { Response } from "express";

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
	catch(exception: unknown, host: ArgumentsHost): void {
		const ctx = host.switchToHttp();
		const response: Response = ctx.getResponse();

		let error: ErrorResponseDto;

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

		return plainToInstance(ErrorResponseDto, errorResponse);
	}

	private _handleHttpException(exception: HttpException) {
		const statusCode = exception.getStatus();

		return plainToInstance(ErrorResponseDto, {
			timestamp: new Date().toISOString(),
			statusCode,
			statusMessage: STATUS_CODES[statusCode],
			message: exception.message,
		});
	}

	private _handleUniqueConstraintException(
		exception: UniqueConstraintViolationException,
	) {
		const statusCode = HttpStatus.CONFLICT;

		return plainToInstance(ErrorResponseDto, {
			timestamp: new Date().toISOString(),
			statusCode,
			statusMessage: STATUS_CODES[statusCode],
			message: JSON.stringify(exception.name),
		});
	}

	private _handleUnknownError(error: unknown) {
		const err = error instanceof Error ? error : new Error(String(error));
		const statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
		const statusMessage = STATUS_CODES[statusCode] || "Internal Server Error";

		return plainToInstance(ErrorResponseDto, {
			timestamp: new Date().toISOString(),
			statusCode,
			statusMessage,
			message: err.message || statusMessage,
		});
	}

	// ref: https://www.yasint.dev/flatten-error-constraints
	private _handleValidationErrors(errors: ValidationError[]) {
		const results: ErrorDetailResponseDto[] = [];
		for (const error of errors) {
			this._flattenError(error, results);
		}
		return results;
	}

	private _flattenError(
		error: ValidationError,
		results: ErrorDetailResponseDto[],
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
