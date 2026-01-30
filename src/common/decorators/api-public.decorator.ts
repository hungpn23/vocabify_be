import { MetadataKey } from "@common";
import { SetMetadata } from "@nestjs/common";

export const ApiPublic = () => SetMetadata(MetadataKey.PUBLIC_ROUTE, true);
