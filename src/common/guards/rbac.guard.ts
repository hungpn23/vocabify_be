import { MetadataKey } from "@common/enums/reflector-key.enum";
import { UserRole } from "@common/enums/user-role.enum";
import { RequestWithUser } from "@common/types/auth.type";
import {
	type CanActivate,
	type ExecutionContext,
	Injectable,
	UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";

@Injectable()
export class RoleBasedAccessControlGuard implements CanActivate {
	constructor(private readonly reflector: Reflector) {}

	canActivate(context: ExecutionContext): boolean {
		const hasPublicDecorator = this.reflector.getAllAndOverride<boolean>(
			MetadataKey.PUBLIC_ROUTE,
			[context.getHandler(), context.getClass()],
		);

		if (hasPublicDecorator) return true;

		const allowedRoles = this.reflector.getAllAndOverride<
			UserRole[] | undefined
		>(MetadataKey.USER_ROLE, [context.getHandler(), context.getClass()]);

		if (!allowedRoles?.length) return true;

		const request = context.switchToHttp().getRequest<RequestWithUser>();
		const user = request.user;
		if (!user) throw new UnauthorizedException();

		return allowedRoles.includes(user.role);
	}
}
