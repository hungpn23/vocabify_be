import type { UUID } from "@common/types";
import { EndCondition, QuestionType, RoomStatus } from "./study-group.enum";

export type RoomSettings = {
	questionTypes: QuestionType;
	endCondition: EndCondition;
	timeLimitMinutes?: number;
	maxPlayers: number;
};

export type RoomInfo = {
	roomId: string;
	name: string;
	hostId: UUID;
	status: RoomStatus;
	settings: RoomSettings;
	passcode: string;
	createdAt: string;
	cardCount: number;
};

export type PlayerInfo = {
	userId: UUID;
	username: string;
	avatar: { url: string; fileId: string } | null;
	joinedAt: string;
	connected: boolean;
};

export type PlayerProgress = {
	userId: UUID;
	username: string;
	avatar: { url: string; fileId: string } | null;
	completed: number;
	total: number;
	percentage: number;
	correct: number;
	incorrect: number;
};

export type ProgressData = {
	completed: number;
	correct: number;
	incorrect: number;
	finishedAt: string | null;
};

export type CardSnapshot = {
	id: UUID;
	term: string;
	termLanguage: string;
	definition: string;
	definitionLanguage: string;
};

export type Ranking = {
	rank: number;
	userId: UUID;
	username: string;
	avatar: { url: string; fileId: string } | null;
	completed: number;
	correct: number;
	incorrect: number;
	accuracy: number;
	timeSeconds: number;
	finished: boolean;
};

export type RoomListItem = {
	roomId: string;
	name: string;
	hostUsername: string;
	playerCount: number;
	maxPlayers: number;
	cardCount: number;
};
