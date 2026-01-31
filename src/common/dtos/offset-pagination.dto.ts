import {
	EnumValidatorOptional,
	NumberValidatorOptional,
	StringValidatorOptional,
} from "@common/decorators";
import { QueryOrder } from "@mikro-orm/core";
import { Exclude, Expose } from "class-transformer";

export class QueryDto {
	@NumberValidatorOptional({ isInt: true, minimum: 1 })
	page: number = 1;

	@NumberValidatorOptional({ isInt: true, minimum: 10 })
	limit: number = 10;

	@EnumValidatorOptional(QueryOrder)
	order: QueryOrder = QueryOrder.DESC_NULLS_LAST;

	@StringValidatorOptional()
	search?: string | null;

	get offset() {
		return this.page ? (this.page - 1) * this.limit : 0;
	}
}

@Exclude()
export class MetadataDto {
	@Expose()
	limit!: number;

	@Expose()
	totalRecords!: number;

	@Expose()
	totalPages!: number;

	@Expose()
	currentPage!: number;

	@Expose()
	nextPage?: number | null;

	@Expose()
	previousPage?: number | null;
}

@Exclude()
export class PaginatedDto<T> {
	// manually define swagger schema model at ApiPaginatedResponse decorator
	@Expose()
	data!: T[];

	@Expose()
	metadata!: MetadataDto;
}
