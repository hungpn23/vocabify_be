import { QueryOrder } from "@mikro-orm/core";
import { type } from "arktype";
import { createArkDto } from "nestjs-arktype";

const positiveIntFromQuery = type("string.numeric.parse|number.integer").narrow(
	(n, ctx) => Number.isInteger(n) || ctx.mustBe("an integer"),
);

const querySchema = type({
	page: positiveIntFromQuery
		.narrow((n, ctx) => n >= 1 || ctx.mustBe("at least 1"))
		.default(1),
	limit: positiveIntFromQuery
		.narrow((n, ctx) => n >= 10 || ctx.mustBe("at least 10"))
		.default(10),
	order: type
		.enumerated(...Object.values(QueryOrder))
		.default(QueryOrder.DESC_NULLS_LAST),
	"search?": "string",
});

export class QueryDto extends createArkDto(querySchema, {
	name: "QueryDto",
	input: true,
}) {
	get offset(): number {
		return (this.page - 1) * this.limit;
	}
}

const metadataResponseSchema = type({
	limit: "number",
	totalRecords: "number",
	totalPages: "number",
	currentPage: "number",
	"nextPage?": "number",
	"previousPage?": "number",
});

export class MetadataResponseDto extends createArkDto(metadataResponseSchema, {
	name: "MetadataResponseDto",
}) {}

const paginatedSchema = type({
	data: "unknown[]",
	metadata: metadataResponseSchema,
});

export class PaginatedDto extends createArkDto(paginatedSchema, {
	name: "PaginatedDto",
}) {}
