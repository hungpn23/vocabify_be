import { SuccessResponseDto } from "@common/dtos";
import { type UUID } from "@common/types";
import { Notification } from "@db/entities";
import {
	EntityManager,
	EntityRepository,
	QueryOrder,
	wrap,
} from "@mikro-orm/core";
import { InjectRepository } from "@mikro-orm/nestjs";
import { Injectable, NotFoundException } from "@nestjs/common";
import { GetNotificationsQueryDto } from "./dtos/notification.dto";
import { GetNotificationsResponseDto } from "./dtos/notification.res.dto";

@Injectable()
export class NotificationService {
	constructor(
		private readonly em: EntityManager,
		@InjectRepository(Notification)
		private readonly notificationRepository: EntityRepository<Notification>,
	) {}

	async getNotifications(
		userId: UUID,
		query: GetNotificationsQueryDto,
	): Promise<GetNotificationsResponseDto> {
		const { limit } = query;

		const [notifications, totalRecords] =
			await this.notificationRepository.findAndCount(
				{ recipient: userId },
				{
					limit,
					orderBy: { createdAt: QueryOrder.DESC },
					populate: ["actor"],
				},
			);

		const data = notifications.map((n) => {
			const plainNoti = wrap(n).toObject();
			const { recipient, ...rest } = plainNoti as typeof plainNoti & {
				recipient: UUID;
			};
			return {
				...rest,
				recipientId: recipient,
			};
		});

		return { data, totalRecords } as unknown as GetNotificationsResponseDto;
	}

	async readNotification(
		userId: UUID,
		notificationId: UUID,
	): Promise<SuccessResponseDto> {
		const notification = await this.notificationRepository.findOne({
			id: notificationId,
			recipient: userId,
		});

		if (!notification) {
			throw new NotFoundException("Notification not found");
		}

		notification.readAt = new Date();
		await this.em.flush();

		return { success: true };
	}

	async readAllNotifications(userId: UUID): Promise<SuccessResponseDto> {
		const notifications = await this.notificationRepository.find({
			recipient: userId,
			readAt: null,
		});

		notifications.forEach((n) => {
			n.readAt = new Date();
		});

		await this.em.flush();

		return { success: true };
	}
}
