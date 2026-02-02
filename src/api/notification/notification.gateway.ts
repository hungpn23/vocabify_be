import { SocketIONamespace } from "@common/enums";
import { SocketWithUser } from "@common/types";
import { getAppConfig } from "@config";
import { Logger } from "@nestjs/common";
import {
	OnGatewayConnection,
	WebSocketGateway,
	WebSocketServer,
} from "@nestjs/websockets";
import { DefaultEventsMap, Server } from "socket.io";
import { NotificationResponseDto } from "./notification.dto";
import { ServerToClientEvents } from "./notification.interface";

@WebSocketGateway({
	namespace: SocketIONamespace.NOTIFICATIONS,
	cors: {
		origin: getAppConfig().frontendUrl,
		credentials: true,
	},
})
export class NotificationGateway implements OnGatewayConnection {
	private readonly logger = new Logger(NotificationGateway.name);

	/**
	 * \@WebSocketServer() decorator injects a server instance by referencing the metadata stored by the \@WebSocketGateway() decorator.
	 * If you provide the namespace option to the \@WebSocketGateway() decorator, \@WebSocketServer() decorator returns a Namespace instance instead of a Server instance.
	 * @see https://docs.nestjs.com/websockets/gateways#server-and-namespace
	 * @bugOrNot A bug?: In this case, it also returns Server instance even though we have namespace configured. And it works as expected (namespace usage won't fit my use case).
	 */
	@WebSocketServer()
	private readonly server!: Server<DefaultEventsMap, ServerToClientEvents>;

	async handleConnection(socket: SocketWithUser) {
		const userId = socket.user.userId;
		this.logger.debug(`Socket connected: ${socket.id} for User: ${userId}`);

		await socket.join(userId);

		this.server
			.to(userId)
			.emit("socketConnected", "Welcome to Notification Service!");
	}

	sendNotification(payload: NotificationResponseDto) {
		this.server.emit("notificationAdded", payload);
	}
}
