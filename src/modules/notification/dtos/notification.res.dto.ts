import { actorResponseSchema } from "@modules/user/user.res.dto";
import { type } from "arktype";
import { createArkDto } from "nestjs-arktype";

const notificationTypeSchema = type("'account'|'custom'|'system'");

const notificationResponseSchema = type({
	id: "string.uuid",
	type: notificationTypeSchema,
	content: "string",
	"readAt?": "Date",
	"actor?": actorResponseSchema,
	recipientId: "string.uuid",
	createdAt: "Date",
});

export class NotificationResponseDto extends createArkDto(
	notificationResponseSchema,
	{ name: "NotificationResponseDto" },
) {}

const getNotificationsResponseSchema = type({
	data: notificationResponseSchema.array(),
	totalRecords: "number",
});

export class GetNotificationsResponseDto extends createArkDto(
	getNotificationsResponseSchema,
	{ name: "GetNotificationsResponseDto" },
) {}
