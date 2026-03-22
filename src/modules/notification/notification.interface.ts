import { NotificationResponseDto } from "./dtos/notification.res.dto";

export interface ServerToClientEvents {
	socketConnected: (message: string) => void;
	notificationAdded: (payload: NotificationResponseDto) => void;
}
