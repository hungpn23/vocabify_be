import { AuthService } from "@api/auth/auth.service";
import { MetadataKey } from "@common/enums/reflector-key.enum";
import { RequestWithUser } from "@common/types/auth.type";
import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";

@Injectable()
export class AuthGuard implements CanActivate {
	constructor(
		private readonly reflector: Reflector,
		private readonly authService: AuthService,
	) {}

	async canActivate(context: ExecutionContext) {
		const request = context.switchToHttp().getRequest<RequestWithUser>();

		const hasPublicDecorator = this.reflector.getAllAndOverride<boolean>(
			MetadataKey.PUBLIC_ROUTE,
			[context.getClass(), context.getHandler()],
		);

		request.user = await this.authService
			.verifyAccessToken(request.headers.authorization)
			.catch((err) => {
				if (hasPublicDecorator) return undefined;

				throw err;
			});

		return true;
	}
}
