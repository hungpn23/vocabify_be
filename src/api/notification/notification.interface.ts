import { NotificationResponseDto } from "./notification.dto";

export interface ServerToClientEvents {
	socketConnected: (message: string) => void;
	notificationAdded: (payload: NotificationResponseDto) => void;
}
