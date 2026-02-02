import { MetadataResponseDto, QueryDto } from "@common/dtos";
import { plainToInstance } from "class-transformer";

export function getMetadataResponseDto(totalRecords: number, query: QueryDto) {
	const limit = query.limit;

	const totalPages = limit > 0 ? Math.ceil(totalRecords / limit) : 0;

	const currentPage = query.page;

	const nextPage = currentPage < totalPages ? currentPage + 1 : undefined;

	const previousPage =
		currentPage > 1 && currentPage - 1 < totalPages
			? currentPage - 1
			: undefined;

	return plainToInstance(MetadataResponseDto, {
		limit,
		totalRecords,
		totalPages,
		currentPage,
		nextPage,
		previousPage,
	});
}
