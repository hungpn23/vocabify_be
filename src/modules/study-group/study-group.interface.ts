import type {
	CardSnapshot,
	PlayerInfo,
	PlayerProgress,
	Ranking,
	RoomInfo,
	RoomListItem,
} from "./study-group.type";

export interface StudyGroupServerToClientEvents {
	roomCreated: (payload: RoomInfo) => void;
	playerJoined: (payload: PlayerInfo) => void;
	playerLeft: (payload: { userId: string }) => void;
	countdownStarted: (payload: { seconds: number }) => void;
	sessionStarted: (payload: {
		cards: CardSnapshot[];
		startedAt: string;
	}) => void;
	progressUpdate: (payload: { players: PlayerProgress[] }) => void;
	sessionEnded: (payload: { rankings: Ranking[] }) => void;
	roomLocked: () => void;
	roomClosed: (payload: { reason: string }) => void;
	roomList: (payload: RoomListItem[]) => void;
	error: (payload: { message: string }) => void;
}

export interface StudyGroupClientToServerEvents {
	createRoom: (payload: {
		name: string;
		deckIds: string[];
		settings: {
			questionTypes: string;
			endCondition: string;
			timeLimitMinutes?: number;
			maxPlayers: number;
		};
	}) => void;
	joinRoom: (payload: { roomId?: string; passcode?: string }) => void;
	startSession: (payload: { roomId: string }) => void;
	answerCard: (payload: {
		roomId: string;
		cardId: string;
		answer: string | number;
		questionType: string;
	}) => void;
	leaveRoom: (payload: { roomId: string }) => void;
	rejoinRoom: (payload: { roomId: string }) => void;
	listRooms: () => void;
}
