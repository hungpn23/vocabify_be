import { CardSuggestion } from "@db/entities/card-suggestion.entity";
import { EntityRepository, wrap } from "@mikro-orm/core";
import { InjectRepository } from "@mikro-orm/nestjs";
import { Injectable, NotFoundException } from "@nestjs/common";
import { plainToInstance } from "class-transformer";
import { CardSuggestionDto, GetCardSuggestionDto } from "./suggestion.dto";

@Injectable()
export class SuggestionService {
	constructor(
		@InjectRepository(CardSuggestion)
		private readonly cardSuggestionRepository: EntityRepository<CardSuggestion>,
	) {}

	async getCardSuggestion(dto: GetCardSuggestionDto) {
		const { term, termLanguage, definitionLanguage } = dto;

		const suggestion = await this.cardSuggestionRepository.findOne({
			term,
			termLanguage,
			definitionLanguage,
		});

		if (!suggestion) throw new NotFoundException();

		return plainToInstance(CardSuggestionDto, wrap(suggestion).toPOJO());
	}
}
