import { type } from "arktype";
import { createArkDto } from "nestjs-arktype";

const getNotificationsQuerySchema = type({
	limit: type("string.numeric.parse|number.integer")
		.narrow((n, ctx) => Number.isInteger(n) || ctx.mustBe("an integer"))
		.narrow((n, ctx) => n >= 10 || ctx.mustBe("at least 10"))
		.default(10),
});

export class GetNotificationsQueryDto extends createArkDto(
	getNotificationsQuerySchema,
	{ name: "GetNotificationsQueryDto", input: true },
) {}
