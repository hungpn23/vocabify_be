import { MetadataKey } from "@common/enums";
import { SetMetadata } from "@nestjs/common";

export type CacheType = "private" | "no_cache";

export const UseCache = (type: CacheType = "private") =>
	SetMetadata(MetadataKey.USE_CACHE, type);
