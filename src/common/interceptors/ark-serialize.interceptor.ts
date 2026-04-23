import {
	ARK_SERIALIZE_KEY,
	type ArkSerializeTarget,
} from "@common/decorators/ark-serialize.decorator";
import {
	type CallHandler,
	type ExecutionContext,
	Injectable,
	InternalServerErrorException,
	Logger,
	type NestInterceptor,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ArkErrors } from "arktype";
import { map, type Observable } from "rxjs";

@Injectable()
export class ArkSerializeInterceptor implements NestInterceptor {
	private readonly logger = new Logger(ArkSerializeInterceptor.name);

	constructor(private readonly reflector: Reflector) {}

	intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
		const dto = this.reflector.get<ArkSerializeTarget | undefined>(
			ARK_SERIALIZE_KEY,
			context.getHandler(),
		);
		if (!dto) return next.handle();

		return next.handle().pipe(
			map((value) => {
				if (value === null || value === undefined) return value;
				const result = dto.schema(value);
				if (result instanceof ArkErrors) {
					this.logger.error(`Response serialization failed: ${result.summary}`);
					throw new InternalServerErrorException(
						"Response serialization failed",
					);
				}
				return result;
			}),
		);
	}
}
