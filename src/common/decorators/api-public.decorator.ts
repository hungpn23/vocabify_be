import { MetadataKey } from "@common/enums/reflector-key.enum";
import { SetMetadata } from "@nestjs/common";

export const ApiPublic = () => SetMetadata(MetadataKey.PUBLIC_ROUTE, true);
