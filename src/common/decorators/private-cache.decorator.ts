import { MetadataKey } from "@common/enums";
import { SetMetadata } from "@nestjs/common";

export const PrivateCache = () => SetMetadata(MetadataKey.PRIVATE_CACHE, true);
