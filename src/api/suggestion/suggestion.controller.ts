import { ApiEndpoint } from "@common/decorators";
import { Body, Controller, Post } from "@nestjs/common";
import {
	CardSuggestionResponseDto,
	DeckSuggestionResponseDto,
	GetCardSuggestionDto,
	GetDeckSuggestionDto,
	GetTermSuggestionDto,
	TermSuggestionResponseDto,
} from "./suggestion.dto";
import { SuggestionService } from "./suggestion.service";

@Controller("suggestion")
export class SuggestionController {
	constructor(private readonly suggestionService: SuggestionService) {}

	@ApiEndpoint({ type: TermSuggestionResponseDto })
	@Post("term")
	async getTermSuggestion(@Body() dto: GetTermSuggestionDto) {
		return await this.suggestionService.getTermSuggestion(dto);
	}

	@ApiEndpoint({ type: CardSuggestionResponseDto })
	@Post("card")
	async getCardSuggestion(@Body() dto: GetCardSuggestionDto) {
		return await this.suggestionService.getCardSuggestion(dto);
	}

	@ApiEndpoint({ type: DeckSuggestionResponseDto })
	@Post("deck")
	async getDeckSuggestion(@Body() dto: GetDeckSuggestionDto) {
		return await this.suggestionService.getDeckSuggestion(dto);
	}
}
