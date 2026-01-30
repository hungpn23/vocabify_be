import { MetadataKey, UserRole } from "@common";
import { SetMetadata } from "@nestjs/common";

export const RoleBaseAccessControl = (...roles: UserRole[]) =>
	SetMetadata(MetadataKey.USER_ROLE, roles);
