import { UserRole } from "@common/enums/user-role.enum";
import { Request as ExpressRequest } from "express";
import { JwtPayload } from "jsonwebtoken";
import { Socket } from "socket.io";
import { Seconds, UUID } from "./branded.type";

type BaseJwtPayload = JwtPayload & {
	sessionId: UUID;
	exp: Seconds;
	// jti: UUID;
};

export type UserJwtPayload = BaseJwtPayload & { userId: UUID; role: UserRole };
export type RefreshTokenPayload = UserJwtPayload & { signature: string };
export type RequestWithUser = ExpressRequest & {
	user?: UserJwtPayload;
};
export type SocketWithUser = Socket & {
	user: UserJwtPayload;
};
