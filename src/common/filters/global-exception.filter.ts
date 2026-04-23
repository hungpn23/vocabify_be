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
	): ErrorResponseDto {
		const response = exception.getResponse() as {
			message?: string;
			details?: ErrorDetailResponseDto[];
		};
		const statusCode = exception.getStatus();

		return {
			timestamp: new Date().toISOString(),
			statusCode,
			message: response.message ?? "Validation failed",
			details: response.details ?? [],
		};
	}

	private _handleHttpException(exception: HttpException): ErrorResponseDto {
		const statusCode = exception.getStatus();

		return {
			timestamp: new Date().toISOString(),
			statusCode,
			statusMessage: STATUS_CODES[statusCode],
			message: exception.message,
		};
	}

	private _handleUniqueConstraintException(
		exception: UniqueConstraintViolationException,
	): ErrorResponseDto {
		const statusCode = HttpStatus.CONFLICT;

		return {
			timestamp: new Date().toISOString(),
			statusCode,
			statusMessage: STATUS_CODES[statusCode],
			message: JSON.stringify(exception),
		};
	}

	private _handleUnknownError(error: unknown): ErrorResponseDto {
		const err = error instanceof Error ? error : new Error(String(error));
		const statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
		const statusMessage = STATUS_CODES[statusCode] || "Internal Server Error";

		return {
			timestamp: new Date().toISOString(),
			statusCode,
			statusMessage,
			message: err.message || statusMessage,
		};
	}
}
