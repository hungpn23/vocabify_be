import { RequestWithUser, UserJwtPayload } from "@common/types/auth.type";
import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const User = createParamDecorator(
	(data: keyof UserJwtPayload | undefined, context: ExecutionContext) => {
		const request = context.switchToHttp().getRequest<RequestWithUser>();
		const user = request.user; // user is set in the AuthGuard

		return data ? user?.[data] : user;
	},
);
