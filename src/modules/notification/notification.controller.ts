import { ApiEndpoint, UseCache, User } from "@common/decorators";
import { SuccessResponseDto } from "@common/dtos";
import { type UUID } from "@common/types";
import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import {
	GetNotificationsQueryDto,
	ReadNotificationDto,
} from "./dtos/notification.dto";
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
	@Post()
	async readNotification(
		@User("userId") userId: UUID,
		@Body() body: ReadNotificationDto,
	) {
		return await this.notificationService.readNotification(userId, body);
	}
}
