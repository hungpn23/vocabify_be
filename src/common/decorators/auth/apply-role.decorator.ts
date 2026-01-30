import { ReflectorKey, UserRole } from "@common";
import { SetMetadata } from "@nestjs/common";

export const ApplyRole = (role: UserRole) =>
	SetMetadata(ReflectorKey.USER_ROLE, role);
