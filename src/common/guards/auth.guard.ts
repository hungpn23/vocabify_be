import { AuthService } from "@api/auth/auth.service";
import { MetadataKey } from "@common/enums/reflector-key.enum";
import { RequestWithUser } from "@common/types/auth.type";
import { extractTokenFromHeader } from "@common/utils";
import {
	CanActivate,
	ExecutionContext,
	Injectable,
	UnauthorizedException,
} from "@nestjs/common";
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

		if (hasPublicDecorator) {
			request.user = undefined;
			return true;
		}

		const accessToken = extractTokenFromHeader(request.headers.authorization);

		if (!accessToken) throw new UnauthorizedException();

		request.user = await this.authService.verifyJwt(accessToken);

		return true;
	}
}
