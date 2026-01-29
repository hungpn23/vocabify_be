import { MetadataKey, RequestWithUser, UserRole } from "@common";
import {
	type CanActivate,
	type ExecutionContext,
	ForbiddenException,
	Injectable,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";

@Injectable()
export class RoleGuard implements CanActivate {
	constructor(private reflector: Reflector) {}

	canActivate(context: ExecutionContext): boolean {
		const requiredRole = this.reflector.getAllAndOverride<UserRole>(
			MetadataKey.USER_ROLE,
			[context.getHandler(), context.getClass()],
		);

		if (!requiredRole) return true;

		const request = context.switchToHttp().getRequest<RequestWithUser>();
		if (!request.user) throw new ForbiddenException();

		return requiredRole === request.user.role;
	}
}
