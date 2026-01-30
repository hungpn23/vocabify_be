import { MetadataKey } from "@common/enums/reflector-key.enum";
import { UserRole } from "@common/enums/user-role.enum";
import { SetMetadata } from "@nestjs/common";

export const RoleBaseAccessControl = (...roles: UserRole[]) =>
	SetMetadata(MetadataKey.USER_ROLE, roles);
