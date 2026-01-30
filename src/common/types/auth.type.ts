import { UserRole } from "@common/enums/user-role.enum";
import { Request as ExpressRequest } from "express";
import { Socket } from "socket.io";
import { Seconds, UUID } from "./branded.type";

type BaseJwtPayload = {
	sessionId: UUID;
	exp?: Seconds;
};

export type UserJwtPayload = BaseJwtPayload & { userId: UUID; role: UserRole };
export type RefreshTokenPayload = UserJwtPayload & { signature: string };
export type RequestWithUser = ExpressRequest & {
	user?: UserJwtPayload;
};
export type SocketWithUser = Socket & {
	user: UserJwtPayload;
};
