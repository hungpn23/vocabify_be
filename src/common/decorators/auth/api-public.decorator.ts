import { ReflectorKey } from "@common";
import { SetMetadata } from "@nestjs/common";

export const ApiPublic = () => SetMetadata(ReflectorKey.PUBLIC_ROUTE, true);
