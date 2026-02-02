import { parseStringValueToSeconds } from "@common/utils";
import { CardSuggestion } from "@db/entities/card-suggestion.entity";
import { EntityRepository, wrap } from "@mikro-orm/core";
import { InjectRepository } from "@mikro-orm/nestjs";
import {
	BadGatewayException,
	Injectable,
	Logger,
	NotFoundException,
} from "@nestjs/common";
import { RedisService } from "@redis/redis.service";
import {
	GetCardSuggestionDto,
	GetTermSuggestionDto,
	TermSuggestionResponseDto,
} from "./suggestion.dto";

@Injectable()
export class SuggestionService {
	private readonly logger = new Logger(SuggestionService.name);

	constructor(
		private readonly redisService: RedisService,
		@InjectRepository(CardSuggestion)
		private readonly cardSuggestionRepository: EntityRepository<CardSuggestion>,
	) {}

	async getTermSuggestion({ partOfSpeech, ...rest }: GetTermSuggestionDto) {
		const where: GetTermSuggestionDto = rest;
		if (partOfSpeech) where.partOfSpeech = partOfSpeech;

		const cachedSuggestion =
			await this.redisService.getValue<TermSuggestionResponseDto>(
				this.redisService.getSuggestionKey(where),
			);

		if (cachedSuggestion) {
			this.logger.debug("Found cached suggestion");
			return cachedSuggestion satisfies TermSuggestionResponseDto;
		}

		const suggestion = await this.cardSuggestionRepository.findOne(where);
		if (!suggestion) throw new NotFoundException();

		const suggestionDto = wrap(
			suggestion,
		).toPOJO() satisfies TermSuggestionResponseDto;

		await this.redisService.setValue(
			this.redisService.getSuggestionKey(where),
			suggestionDto,
			parseStringValueToSeconds("5m"),
		);

		return suggestionDto;
	}

	async getCardSuggestion(dto: GetCardSuggestionDto) {
		throw new BadGatewayException("Not implemented");
	}

	async getDeckSuggestion(dto: unknown) {
		throw new BadGatewayException("Not implemented");
	}
}
