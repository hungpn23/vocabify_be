import { JwtToken } from "@common/enums/jwt-token.enum";
import { UserRole } from "@common/enums/user-role.enum";
import { Request as ExpressRequest } from "express";
import { JwtPayload } from "jsonwebtoken";
import { Socket } from "socket.io";
import { UUID } from "./branded.type";

export type UserJwtPayload = JwtPayload & {
	userId: UUID;
	sessionId: UUID;
	jwtType: JwtToken;
	role: UserRole;
	jti: UUID;
};
// export type RefreshTokenPayload = UserJwtPayload & { signature: string };
export type RequestWithUser = ExpressRequest & {
	user?: UserJwtPayload;
};
export type SocketWithUser = Socket & {
	user: UserJwtPayload;
};
