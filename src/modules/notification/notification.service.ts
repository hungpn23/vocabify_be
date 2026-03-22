import { type UUID } from "@common/types";
import { Notification } from "@db/entities";
import { EntityRepository, QueryOrder, wrap } from "@mikro-orm/core";
import { InjectRepository } from "@mikro-orm/nestjs";
import { ActorResponseDto } from "@modules/user/user.res.dto";
import { Injectable } from "@nestjs/common";
import { plainToInstance } from "class-transformer";
import { GetNotificationsQueryDto } from "./dtos/notification.dto";
import {
	NotificationResponseDto,
	NotificationsResponseDto,
} from "./dtos/notification.res.dto";

@Injectable()
export class NotificationService {
	constructor(
		@InjectRepository(Notification)
		private readonly notificationRepo: EntityRepository<Notification>,
	) {}

	async getNotifications(
		userId: UUID,
		query: GetNotificationsQueryDto,
	): Promise<NotificationsResponseDto> {
		const { limit } = query;

		const [notifications, totalRecords] =
			await this.notificationRepo.findAndCount(
				{ recipient: userId },
				{
					limit,
					orderBy: { createdAt: QueryOrder.DESC },
					populate: ["actor"],
				},
			);

		const data = notifications.map((n) => {
			const plainNoti = wrap(n).toObject();

			return plainToInstance(NotificationResponseDto, {
				...plainNoti,
				actor: plainToInstance(ActorResponseDto, plainNoti.actor),
			});
		});

		return { data, totalRecords };
	}
}
