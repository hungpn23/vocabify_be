import { RequestWithUser, UserJwtPayload } from "@common";
import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const User = createParamDecorator(
	(data: keyof UserJwtPayload | undefined, context: ExecutionContext) => {
		const request = context.switchToHttp().getRequest<RequestWithUser>();
		const user = request.user; // user is set in the AuthGuard

		return data ? user?.[data] : user;
	},
);
