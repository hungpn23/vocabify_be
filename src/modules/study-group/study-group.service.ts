import { randomInt } from "node:crypto";
import type { Seconds, UUID } from "@common/types";
import { Deck } from "@db/entities";
import { EntityManager } from "@mikro-orm/core";
import { InjectRepository } from "@mikro-orm/nestjs";
import { EntityRepository } from "@mikro-orm/postgresql";
import { REDIS_CLIENT } from "@modules/redis/redis.constant";
import { RedisService } from "@modules/redis/redis.service";
import { Inject, Injectable, Logger } from "@nestjs/common";
import { Redis } from "ioredis";
import { RoomStatus } from "./study-group.enum";
import type {
	CardSnapshot,
	PlayerInfo,
	PlayerProgress,
	ProgressData,
	Ranking,
	RoomInfo,
	RoomSettings,
} from "./study-group.type";
import { evaluateAnswer } from "./utils/answer-evaluation.util";
import { calculateRankings } from "./utils/ranking.util";

const ROOM_TTL = 7200 as Seconds; // 2 hours
const ROOM_ID_LENGTH = 8;

function generateRoomId(): string {
	const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
	let result = "";
	for (let i = 0; i < ROOM_ID_LENGTH; i++) {
		result += chars[randomInt(chars.length)];
	}
	return result;
}

function generatePasscode(): string {
	return String(randomInt(100000, 999999));
}

function key(roomId: string, suffix: string) {
	return `study-group:${roomId}:${suffix}`;
}

@Injectable()
export class StudyGroupService {
	private readonly logger = new Logger(StudyGroupService.name);
	private readonly timers = new Map<string, NodeJS.Timeout>();

	constructor(
		private readonly redis: RedisService,
		@Inject(REDIS_CLIENT) private readonly redisClient: Redis,
		private readonly em: EntityManager,
		@InjectRepository(Deck)
		private readonly deckRepository: EntityRepository<Deck>,
	) {}

	async createRoom(
		userId: UUID,
		username: string,
		avatar: PlayerInfo["avatar"],
		name: string,
		deckIds: string[],
		settings: RoomSettings,
	): Promise<RoomInfo> {
		const decks = await this.deckRepository.find(
			{ id: { $in: deckIds as UUID[] }, owner: userId },
			{ populate: ["cards"] },
		);

		if (decks.length === 0) {
			throw new Error("No valid decks found");
		}

		const cards: CardSnapshot[] = [];
		for (const deck of decks) {
			for (const card of deck.cards) {
				cards.push({
					id: card.id,
					term: card.term,
					termLanguage: card.termLanguage,
					definition: card.definition,
					definitionLanguage: card.definitionLanguage,
				});
			}
		}

		if (cards.length === 0) {
			throw new Error("Selected decks have no cards");
		}

		const roomId = generateRoomId();
		const passcode = generatePasscode();
		const now = new Date().toISOString();

		const roomInfo: RoomInfo = {
			roomId,
			name,
			hostId: userId,
			status: RoomStatus.WAITING,
			settings,
			passcode,
			createdAt: now,
			cardCount: cards.length,
		};

		await this.redis.setValue(key(roomId, "info"), roomInfo, ROOM_TTL);
		await this.redis.setValue(key(roomId, "cards"), cards, ROOM_TTL);

		// Host auto-joins
		const hostPlayer: PlayerInfo = {
			userId,
			username,
			avatar,
			joinedAt: now,
			connected: true,
		};
		await this.redis.hset(key(roomId, "players"), userId, hostPlayer, ROOM_TTL);

		return roomInfo;
	}

	async joinRoom(
		roomId: string,
		userId: UUID,
		username: string,
		avatar: PlayerInfo["avatar"],
	): Promise<{ roomInfo: RoomInfo; players: PlayerInfo[] }> {
		const roomInfo = await this.redis.getValue<RoomInfo>(key(roomId, "info"));
		if (!roomInfo) throw new Error("Room not found");
		if (roomInfo.status !== RoomStatus.WAITING)
			throw new Error("Room is locked");

		const playersMap = await this.redis.hgetall<Record<string, PlayerInfo>>(
			key(roomId, "players"),
		);
		const players = playersMap ? Object.values(playersMap) : [];

		if (players.some((p) => p.userId === userId)) {
			throw new Error("Already in room");
		}

		if (players.length >= roomInfo.settings.maxPlayers) {
			throw new Error("Room is full");
		}

		const playerInfo: PlayerInfo = {
			userId,
			username,
			avatar,
			joinedAt: new Date().toISOString(),
			connected: true,
		};

		await this.redis.hset(key(roomId, "players"), userId, playerInfo, ROOM_TTL);

		return { roomInfo, players: [...players, playerInfo] };
	}

	async joinByPasscode(
		passcode: string,
		userId: UUID,
		username: string,
		avatar: PlayerInfo["avatar"],
	): Promise<{ roomId: string; roomInfo: RoomInfo; players: PlayerInfo[] }> {
		const rooms = await this.getWaitingRooms();
		const room = rooms.find((r) => r.passcode === passcode);
		if (!room) throw new Error("Invalid passcode");

		const result = await this.joinRoom(room.roomId, userId, username, avatar);
		return { roomId: room.roomId, ...result };
	}

	async startCountdown(roomId: string, userId: UUID): Promise<void> {
		const roomInfo = await this.redis.getValue<RoomInfo>(key(roomId, "info"));
		if (!roomInfo) throw new Error("Room not found");
		if (roomInfo.hostId !== userId) throw new Error("Only host can start");
		if (roomInfo.status !== RoomStatus.WAITING)
			throw new Error("Room not in waiting state");

		const playersMap = await this.redis.hgetall<Record<string, PlayerInfo>>(
			key(roomId, "players"),
		);
		const playerCount = playersMap ? Object.keys(playersMap).length : 0;
		if (playerCount < 2) throw new Error("Need at least 2 players");

		roomInfo.status = RoomStatus.COUNTDOWN;
		await this.redis.setValue(key(roomId, "info"), roomInfo, ROOM_TTL);
	}

	async startSession(
		roomId: string,
	): Promise<{ cards: CardSnapshot[]; startedAt: string }> {
		const roomInfo = await this.redis.getValue<RoomInfo>(key(roomId, "info"));
		if (!roomInfo) throw new Error("Room not found");

		roomInfo.status = RoomStatus.PLAYING;
		const startedAt = new Date().toISOString();
		await this.redis.setValue(
			key(roomId, "info"),
			{ ...roomInfo, startedAt },
			ROOM_TTL,
		);

		const cards = await this.redis.getValue<CardSnapshot[]>(
			key(roomId, "cards"),
		);
		if (!cards) throw new Error("Cards not found");

		// Initialize progress for all players
		const playersMap = await this.redis.hgetall<Record<string, PlayerInfo>>(
			key(roomId, "players"),
		);
		if (playersMap) {
			for (const usrId of Object.keys(playersMap)) {
				const initialProgress: ProgressData = {
					completed: 0,
					correct: 0,
					incorrect: 0,
					finishedAt: null,
				};
				await this.redis.hset(
					key(roomId, "progress"),
					usrId,
					initialProgress,
					ROOM_TTL,
				);
			}
		}

		return { cards, startedAt };
	}

	async processAnswer(
		roomId: string,
		userId: UUID,
		cardId: string,
		answer: string | number,
		questionType: string,
	): Promise<{
		isCorrect: boolean;
		status: string;
		progress: PlayerProgress[];
		sessionEnded: boolean;
		rankings?: Ranking[];
	}> {
		const roomInfo = await this.redis.getValue<
			RoomInfo & { startedAt?: string }
		>(key(roomId, "info"));
		if (!roomInfo || roomInfo.status !== RoomStatus.PLAYING) {
			throw new Error("Room not in playing state");
		}

		const cards = await this.redis.getValue<CardSnapshot[]>(
			key(roomId, "cards"),
		);
		if (!cards) throw new Error("Cards not found");

		const card = cards.find((c) => c.id === cardId);
		if (!card) throw new Error("Card not found");

		const correctAnswer = card.definition;
		const result = evaluateAnswer(
			answer,
			correctAnswer,
			questionType as "multiple_choices" | "written",
			typeof answer === "number" ? answer : undefined,
		);

		// Update progress in Redis
		const currentProgress = await this.redis.hget<ProgressData>(
			key(roomId, "progress"),
			userId,
		);
		const progress: ProgressData = currentProgress ?? {
			completed: 0,
			correct: 0,
			incorrect: 0,
			finishedAt: null,
		};

		if (result.isCorrect) {
			progress.completed++;
			progress.correct++;
			if (progress.completed >= cards.length) {
				progress.finishedAt = new Date().toISOString();
			}
		} else {
			progress.incorrect++;
		}

		await this.redis.hset(key(roomId, "progress"), userId, progress, ROOM_TTL);

		// Get all players' progress for broadcast
		const allProgress = await this.getPlayersProgress(roomId, cards.length);

		// Check end condition
		const sessionEnded = this.checkEndCondition(roomInfo, allProgress);
		let rankings: Ranking[] | undefined;

		if (sessionEnded) {
			rankings = await this.endSession(roomId);
		}

		return {
			isCorrect: result.isCorrect,
			status: result.status,
			progress: allProgress,
			sessionEnded,
			rankings,
		};
	}

	async getPlayersProgress(
		roomId: string,
		totalCards: number,
	): Promise<PlayerProgress[]> {
		const playersMap = await this.redis.hgetall<Record<string, PlayerInfo>>(
			key(roomId, "players"),
		);
		const progressMap = await this.redis.hgetall<Record<string, ProgressData>>(
			key(roomId, "progress"),
		);
		if (!playersMap) return [];

		return Object.entries(playersMap).map(([usrId, player]) => {
			const prog = progressMap?.[usrId] ?? {
				completed: 0,
				correct: 0,
				incorrect: 0,
				finishedAt: null,
			};
			return {
				userId: usrId as PlayerProgress["userId"],
				username: player.username,
				avatar: player.avatar,
				completed: prog.completed,
				total: totalCards,
				percentage:
					totalCards > 0 ? Math.round((prog.completed / totalCards) * 100) : 0,
				correct: prog.correct,
				incorrect: prog.incorrect,
			};
		});
	}

	private checkEndCondition(
		roomInfo: RoomInfo & { startedAt?: string },
		progress: PlayerProgress[],
	): boolean {
		switch (roomInfo.settings.endCondition) {
			case "first_finish":
				return progress.some((p) => p.completed >= p.total);
			case "all_finish":
				return progress.every((p) => p.completed >= p.total);
			case "time_limit":
				return false; // Handled by timer
			default:
				return false;
		}
	}

	async endSession(roomId: string): Promise<Ranking[]> {
		const roomInfo = await this.redis.getValue<
			RoomInfo & { startedAt?: string }
		>(key(roomId, "info"));
		if (!roomInfo) return [];

		roomInfo.status = RoomStatus.FINISHED;
		await this.redis.setValue(key(roomId, "info"), roomInfo, ROOM_TTL);

		const playersMap = await this.redis.hgetall<Record<string, PlayerInfo>>(
			key(roomId, "players"),
		);
		const progressMap = await this.redis.hgetall<Record<string, ProgressData>>(
			key(roomId, "progress"),
		);
		if (!playersMap || !progressMap) return [];

		const rankings = calculateRankings(
			playersMap,
			progressMap,
			roomInfo.cardCount,
			roomInfo.startedAt ?? roomInfo.createdAt,
		);

		// Clear timer if exists
		const timer = this.timers.get(roomId);
		if (timer) {
			clearTimeout(timer);
			this.timers.delete(roomId);
		}

		return rankings;
	}

	async getWaitingRooms(): Promise<
		(RoomInfo & { hostUsername: string; playerCount: number })[]
	> {
		const keys: string[] = [];
		let cursor = "0";
		do {
			const [nextCursor, foundKeys] = await this.scanKeys(
				"study-group:*:info",
				cursor,
			);
			cursor = nextCursor;
			keys.push(...foundKeys);
		} while (cursor !== "0");

		const rooms: (RoomInfo & { hostUsername: string; playerCount: number })[] =
			[];
		for (const k of keys) {
			const roomInfo = await this.redis.getValue<RoomInfo>(k);
			if (roomInfo && roomInfo.status === RoomStatus.WAITING) {
				const roomId = k.split(":")[1]!;
				const playersMap = await this.redis.hgetall<Record<string, PlayerInfo>>(
					key(roomId, "players"),
				);
				const host = playersMap?.[roomInfo.hostId];
				rooms.push({
					...roomInfo,
					hostUsername: host?.username ?? "Unknown",
					playerCount: playersMap ? Object.keys(playersMap).length : 0,
				});
			}
		}

		return rooms;
	}

	private async scanKeys(
		pattern: string,
		cursor: string,
	): Promise<[string, string[]]> {
		const [nextCursor, keys] = await this.redisClient.scan(
			cursor,
			"MATCH",
			pattern,
			"COUNT",
			100,
		);
		return [nextCursor, keys];
	}

	async getRoomInfo(roomId: string): Promise<RoomInfo | null> {
		return this.redis.getValue<RoomInfo>(key(roomId, "info"));
	}

	async getCards(roomId: string): Promise<CardSnapshot[]> {
		return (
			(await this.redis.getValue<CardSnapshot[]>(key(roomId, "cards"))) ?? []
		);
	}

	async getPlayers(roomId: string): Promise<PlayerInfo[]> {
		const playersMap = await this.redis.hgetall<Record<string, PlayerInfo>>(
			key(roomId, "players"),
		);
		return playersMap ? Object.values(playersMap) : [];
	}

	async removePlayer(roomId: string, userId: UUID): Promise<void> {
		await this.redis.hdel(key(roomId, "players"), userId);
	}

	async setPlayerConnected(
		roomId: string,
		userId: UUID,
		connected: boolean,
	): Promise<void> {
		const player = await this.redis.hget<PlayerInfo>(
			key(roomId, "players"),
			userId,
		);
		if (player) {
			player.connected = connected;
			await this.redis.hset(key(roomId, "players"), userId, player, ROOM_TTL);
		}
	}

	async cleanupRoom(roomId: string): Promise<void> {
		const timer = this.timers.get(roomId);
		if (timer) {
			clearTimeout(timer);
			this.timers.delete(roomId);
		}
		await this.redis.deleteKeys([
			key(roomId, "info"),
			key(roomId, "players"),
			key(roomId, "progress"),
			key(roomId, "cards"),
		]);
	}

	shuffleCards(cards: CardSnapshot[]): CardSnapshot[] {
		const shuffled = [...cards];
		for (let i = shuffled.length - 1; i > 0; i--) {
			const j = randomInt(i + 1);
			[shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!];
		}
		return shuffled;
	}
}
