import { MetadataKey } from "@common/enums";
import { RequestWithUser } from "@common/types";
import { getPrivateCacheKey } from "@common/utils";
import { CacheInterceptor } from "@nestjs/cache-manager";
import { ExecutionContext, Injectable } from "@nestjs/common";

@Injectable()
export class HttpCacheInterceptor extends CacheInterceptor {
	override allowedMethods: string[] = ["GET"];

	override trackBy(context: ExecutionContext): string | undefined {
		const req = context.switchToHttp().getRequest<RequestWithUser>();

		if (!this.allowedMethods.includes(req.method)) return undefined;

		const isPrivate = this.reflector.getAllAndOverride<boolean>(
			MetadataKey.PRIVATE_CACHE,
			[context.getClass(), context.getHandler()],
		);

		if (isPrivate && !req.user) return undefined;
		if (isPrivate && req.user)
			return getPrivateCacheKey(req.user.userId, req.url);

		return req.url;
	}
}
