import { SocketIONamespace } from "@common/enums";
import { SocketWithUser } from "@common/types";
import { extractTokenFromHeader } from "@common/utils";
import { AuthService } from "@modules/auth/auth.service";
import { INestApplication, UnauthorizedException } from "@nestjs/common";
import { IoAdapter } from "@nestjs/platform-socket.io";
import { ExtendedError, Server, ServerOptions, Socket } from "socket.io";

export class SocketIOAdapter extends IoAdapter {
	constructor(
		readonly app: INestApplication,
		private readonly authService: AuthService,
	) {
		super(app);
	}

	override createIOServer(port: number, options?: ServerOptions) {
		const server = super.createIOServer(port, options) as Server;

		server
			.of(SocketIONamespace.NOTIFICATIONS)
			.use((socket: Socket, next: (err?: ExtendedError) => void) => {
				const accessToken = extractTokenFromHeader(
					socket.handshake.headers.authorization,
				);

				this.authService
					.verifyJwt(accessToken)
					.then((payload) => {
						(socket as SocketWithUser).user = payload;
						next();
					})
					.catch((ex: UnauthorizedException) => {
						const error: ExtendedError = new Error(ex.message);
						error.data = ex.getResponse();

						next(error);
					});
			});

		server
			.of(SocketIONamespace.STUDY_GROUP)
			.use((socket: Socket, next: (err?: ExtendedError) => void) => {
				const accessToken = extractTokenFromHeader(
					socket.handshake.headers.authorization,
				);

				this.authService
					.verifyJwt(accessToken)
					.then((payload) => {
						(socket as SocketWithUser).user = payload;
						next();
					})
					.catch((ex: UnauthorizedException) => {
						const error: ExtendedError = new Error(ex.message);
						error.data = ex.getResponse();

						next(error);
					});
			});

		return server;
	}
}
