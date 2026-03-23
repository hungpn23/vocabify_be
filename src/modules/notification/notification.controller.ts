import { ApiEndpoint, UseCache, User } from "@common/decorators";
import { SuccessResponseDto } from "@common/dtos";
import { type UUID } from "@common/types";
import {
	Controller,
	Get,
	Param,
	ParseUUIDPipe,
	Post,
	Query,
} from "@nestjs/common";
import { GetNotificationsQueryDto } from "./dtos/notification.dto";
import { GetNotificationsResponseDto } from "./dtos/notification.res.dto";
import { NotificationService } from "./notification.service";

@Controller("notifications")
export class NotificationController {
	constructor(private readonly notificationService: NotificationService) {}

	@UseCache()
	@ApiEndpoint({ responseType: GetNotificationsResponseDto })
	@Get()
	async getNotifications(
		@User("userId") userId: UUID,
		@Query() query: GetNotificationsQueryDto,
	) {
		return await this.notificationService.getNotifications(userId, query);
	}

	@ApiEndpoint({ responseType: SuccessResponseDto })
	@Post("read/:notificationId")
	async readNotification(
		@User("userId") userId: UUID,
		@Param("notificationId", ParseUUIDPipe) notificationId: UUID,
	) {
		return await this.notificationService.readNotification(
			userId,
			notificationId,
		);
	}

	@ApiEndpoint({ responseType: SuccessResponseDto })
	@Post("read-all")
	async readAllNotifications(@User("userId") userId: UUID) {
		return await this.notificationService.readAllNotifications(userId);
	}
}
