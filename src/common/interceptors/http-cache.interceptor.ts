import { CacheType } from "@common/decorators";
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

		const cacheType = this.reflector.getAllAndOverride<CacheType>(
			MetadataKey.CACHE_CONTROL,
			[context.getClass(), context.getHandler()],
		);

		if (cacheType === "no_cache") return undefined;
		if (cacheType === "private" && !req.user) return undefined;
		if (cacheType === "private" && req.user)
			return getPrivateCacheKey(req.user.userId, req.url);

		return req.url;
	}
}
