import { ApiEndpoint, UseCache, User } from "@common/decorators";
import { type UUID } from "@common/types";
import { Controller, Get, Query } from "@nestjs/common";
import { GetNotificationsQueryDto } from "./dtos/notification.dto";
import { NotificationsResponseDto } from "./dtos/notification.res.dto";
import { NotificationService } from "./notification.service";

@Controller("notifications")
export class NotificationController {
	constructor(private readonly notificationService: NotificationService) {}

	@UseCache()
	@ApiEndpoint({
		type: NotificationsResponseDto,
	})
	@Get()
	async getMany(
		@User("userId") userId: UUID,
		@Query() query: GetNotificationsQueryDto,
	) {
		return await this.notificationService.getNotifications(userId, query);
	}
}
