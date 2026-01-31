import { parseStringValueToSeconds } from "@common/utils";
import { CardSuggestion } from "@db/entities/card-suggestion.entity";
import { EntityRepository, wrap } from "@mikro-orm/core";
import { InjectRepository } from "@mikro-orm/nestjs";
import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { RedisService } from "@redis/redis.service";
import { CardSuggestionDto, GetCardSuggestionDto } from "./suggestion.dto";

@Injectable()
export class SuggestionService {
	private readonly logger = new Logger(SuggestionService.name);

	constructor(
		private readonly redisService: RedisService,
		@InjectRepository(CardSuggestion)
		private readonly cardSuggestionRepository: EntityRepository<CardSuggestion>,
	) {}

	async getCardSuggestion({ partOfSpeech, ...rest }: GetCardSuggestionDto) {
		const where: GetCardSuggestionDto = rest;
		if (partOfSpeech) where.partOfSpeech = partOfSpeech;

		const cachedSuggestion =
			await this.redisService.getValue<CardSuggestionDto>(
				this.redisService.getSuggestionKey(where),
			);

		if (cachedSuggestion) {
			this.logger.debug("Found cached suggestion");
			return cachedSuggestion satisfies CardSuggestionDto;
		}

		const suggestion = await this.cardSuggestionRepository.findOne(where);
		if (!suggestion) throw new NotFoundException();

		const suggestionDto = wrap(suggestion).toPOJO() satisfies CardSuggestionDto;

		await this.redisService.setValue(
			this.redisService.getSuggestionKey(where),
			suggestionDto,
			parseStringValueToSeconds("5m"),
		);

		return suggestionDto;
	}
}
