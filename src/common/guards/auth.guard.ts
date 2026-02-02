import { AuthService } from "@api/auth/auth.service";
import { MetadataKey } from "@common/enums";
import { RequestWithUser } from "@common/types";
import { extractTokenFromHeader } from "@common/utils";
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

		const accessToken = extractTokenFromHeader(request.headers.authorization);

		request.user = await this.authService
			.verifyJwt(accessToken)
			.catch((err) => {
				if (hasPublicDecorator) return undefined;

				throw err;
			});

		return true;
	}
}
