import { SocketIONamespace } from "@common/enums";
import type { SocketWithUser } from "@common/types";
import { getAppConfig } from "@config";
import { Logger } from "@nestjs/common";
import {
	ConnectedSocket,
	MessageBody,
	OnGatewayConnection,
	OnGatewayDisconnect,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
} from "@nestjs/websockets";
import { DefaultEventsMap, Server, Socket } from "socket.io";
import type { StudyGroupServerToClientEvents } from "./study-group.interface";
import { StudyGroupService } from "./study-group.service";

@WebSocketGateway({
	namespace: SocketIONamespace.STUDY_GROUP,
	cors: {
		origin: getAppConfig().frontendUrl,
		credentials: true,
	},
})
export class StudyGroupGateway
	implements OnGatewayConnection, OnGatewayDisconnect
{
	private readonly logger = new Logger(StudyGroupGateway.name);
	// Map socketId -> { userId, roomId }
	private readonly socketRooms = new Map<
		string,
		{ userId: string; roomId: string }
	>();

	@WebSocketServer()
	private readonly server!: Server<
		DefaultEventsMap,
		StudyGroupServerToClientEvents
	>;

	constructor(private readonly studyGroupService: StudyGroupService) {}

	async handleConnection(socket: Socket) {
		const user = (socket as SocketWithUser).user;
		this.logger.debug(
			`Study Group socket connected: ${socket.id} for User: ${user.userId}`,
		);
	}

	async handleDisconnect(socket: Socket) {
		const mapping = this.socketRooms.get(socket.id);
		if (!mapping) return;

		this.logger.debug(
			`Player ${mapping.userId} disconnected from room ${mapping.roomId}`,
		);
		this.socketRooms.delete(socket.id);

		await this.studyGroupService.setPlayerConnected(
			mapping.roomId,
			mapping.userId as any,
			false,
		);

		this.server
			.to(mapping.roomId)
			.emit("playerLeft", { userId: mapping.userId });

		// Schedule cleanup: if host disconnects during waiting, close room after 60s
		const roomInfo = await this.studyGroupService.getRoomInfo(mapping.roomId);
		if (
			roomInfo &&
			roomInfo.status === "waiting" &&
			roomInfo.hostId === mapping.userId
		) {
			setTimeout(async () => {
				const updated = await this.studyGroupService.getRoomInfo(
					mapping.roomId,
				);
				if (updated && updated.status === "waiting") {
					const player = (
						await this.studyGroupService.getPlayers(mapping.roomId)
					).find((p) => p.userId === mapping.userId);
					if (!player || !player.connected) {
						this.server
							.to(mapping.roomId)
							.emit("roomClosed", { reason: "Host disconnected" });
						await this.studyGroupService.cleanupRoom(mapping.roomId);
					}
				}
			}, 60_000);
		}
	}

	@SubscribeMessage("createRoom")
	async handleCreateRoom(
		@ConnectedSocket() socket: Socket,
		@MessageBody()
		payload: {
			name: string;
			deckIds: string[];
			settings: any;
			username: string;
			avatar: any;
		},
	) {
		try {
			const { userId } = (socket as SocketWithUser).user;
			const roomInfo = await this.studyGroupService.createRoom(
				userId,
				payload.username,
				payload.avatar,
				payload.name,
				payload.deckIds,
				payload.settings,
			);

			await socket.join(roomInfo.roomId);
			this.socketRooms.set(socket.id, {
				userId,
				roomId: roomInfo.roomId,
			});

			socket.emit("roomCreated", roomInfo);
		} catch (err: any) {
			socket.emit("error", { message: err.message });
		}
	}

	@SubscribeMessage("joinRoom")
	async handleJoinRoom(
		@ConnectedSocket() socket: Socket,
		@MessageBody()
		payload: {
			roomId?: string;
			passcode?: string;
			username: string;
			avatar: any;
		},
	) {
		try {
			const { userId } = (socket as SocketWithUser).user;
			let roomId: string;
			let result: any;

			if (payload.passcode) {
				const res = await this.studyGroupService.joinByPasscode(
					payload.passcode,
					userId,
					payload.username,
					payload.avatar,
				);
				roomId = res.roomId;
				result = res;
			} else if (payload.roomId) {
				roomId = payload.roomId;
				result = await this.studyGroupService.joinRoom(
					roomId,
					userId,
					payload.username,
					payload.avatar,
				);
			} else {
				throw new Error("roomId or passcode required");
			}

			await socket.join(roomId);
			this.socketRooms.set(socket.id, { userId, roomId });

			const newPlayer = result.players.find((p: any) => p.userId === userId);
			if (newPlayer) {
				this.server.to(roomId).emit("playerJoined", newPlayer);
			}
		} catch (err: any) {
			socket.emit("error", { message: err.message });
		}
	}

	@SubscribeMessage("startSession")
	async handleStartSession(
		@ConnectedSocket() socket: Socket,
		@MessageBody() payload: { roomId: string },
	) {
		try {
			await this.studyGroupService.startCountdown(
				payload.roomId,
				(socket as SocketWithUser).user.userId,
			);

			this.server.to(payload.roomId).emit("roomLocked");
			this.server.to(payload.roomId).emit("countdownStarted", { seconds: 3 });

			// After 3s countdown, start the session
			setTimeout(async () => {
				try {
					const { cards, startedAt } =
						await this.studyGroupService.startSession(payload.roomId);

					// Send shuffled cards to each player individually
					const sockets = await this.server.in(payload.roomId).fetchSockets();
					for (const s of sockets) {
						const shuffled = this.studyGroupService.shuffleCards(cards);
						s.emit("sessionStarted", { cards: shuffled, startedAt });
					}

					// Set up time limit callback if needed
					const roomInfo = await this.studyGroupService.getRoomInfo(
						payload.roomId,
					);
					if (
						roomInfo?.settings.endCondition === "time_limit" &&
						roomInfo.settings.timeLimitMinutes
					) {
						const ms = roomInfo.settings.timeLimitMinutes * 60 * 1000;
						setTimeout(async () => {
							const current = await this.studyGroupService.getRoomInfo(
								payload.roomId,
							);
							if (current && current.status === "playing") {
								const rankings = await this.studyGroupService.endSession(
									payload.roomId,
								);
								this.server
									.to(payload.roomId)
									.emit("sessionEnded", { rankings });
							}
						}, ms);
					}
				} catch (err: any) {
					this.server
						.to(payload.roomId)
						.emit("error", { message: err.message });
				}
			}, 3000);
		} catch (err: any) {
			socket.emit("error", { message: err.message });
		}
	}

	@SubscribeMessage("answerCard")
	async handleAnswerCard(
		@ConnectedSocket() socket: Socket,
		@MessageBody()
		payload: {
			roomId: string;
			cardId: string;
			answer: string | number;
			questionType: string;
		},
	) {
		try {
			const result = await this.studyGroupService.processAnswer(
				payload.roomId,
				(socket as SocketWithUser).user.userId,
				payload.cardId,
				payload.answer,
				payload.questionType,
			);

			// Send answer result to the player who answered
			socket.emit("answerResult" as any, {
				isCorrect: result.isCorrect,
				status: result.status,
			});

			// Broadcast progress to entire room
			this.server
				.to(payload.roomId)
				.emit("progressUpdate", { players: result.progress });

			// If session ended, broadcast results
			if (result.sessionEnded && result.rankings) {
				this.server
					.to(payload.roomId)
					.emit("sessionEnded", { rankings: result.rankings });
			}
		} catch (err: any) {
			socket.emit("error", { message: err.message });
		}
	}

	@SubscribeMessage("leaveRoom")
	async handleLeaveRoom(
		@ConnectedSocket() socket: Socket,
		@MessageBody() payload: { roomId: string },
	) {
		try {
			const { userId } = (socket as SocketWithUser).user;
			await this.studyGroupService.removePlayer(payload.roomId, userId);
			await socket.leave(payload.roomId);
			this.socketRooms.delete(socket.id);

			this.server.to(payload.roomId).emit("playerLeft", { userId });
		} catch (err: any) {
			socket.emit("error", { message: err.message });
		}
	}

	@SubscribeMessage("rejoinRoom")
	async handleRejoinRoom(
		@ConnectedSocket() socket: Socket,
		@MessageBody() payload: { roomId: string },
	) {
		try {
			const { userId } = (socket as SocketWithUser).user;
			await this.studyGroupService.setPlayerConnected(
				payload.roomId,
				userId,
				true,
			);
			await socket.join(payload.roomId);
			this.socketRooms.set(socket.id, {
				userId,
				roomId: payload.roomId,
			});

			const roomInfo = await this.studyGroupService.getRoomInfo(payload.roomId);
			if (!roomInfo) throw new Error("Room not found");

			socket.emit("roomCreated", roomInfo);

			if (roomInfo.status === "playing") {
				const cards = this.studyGroupService.shuffleCards(
					await this.studyGroupService.getCards(payload.roomId),
				);
				socket.emit("sessionStarted" as any, {
					cards,
					startedAt: (roomInfo as any).startedAt ?? roomInfo.createdAt,
				});

				const progress = await this.studyGroupService.getPlayersProgress(
					payload.roomId,
					roomInfo.cardCount,
				);
				socket.emit("progressUpdate", { players: progress });
			}
		} catch (err: any) {
			socket.emit("error", { message: err.message });
		}
	}

	@SubscribeMessage("listRooms")
	async handleListRooms(@ConnectedSocket() socket: SocketWithUser) {
		try {
			const rooms = await this.studyGroupService.getWaitingRooms();
			const list = rooms.map((r) => ({
				roomId: r.roomId,
				name: r.name,
				hostUsername: r.hostUsername,
				playerCount: r.playerCount,
				maxPlayers: r.settings.maxPlayers,
				cardCount: r.cardCount,
			}));
			socket.emit("roomList", list);
		} catch (err: any) {
			socket.emit("error", { message: err.message });
		}
	}
}
