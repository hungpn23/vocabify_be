import { ApiEndpoint } from "@common/decorators/api-endpoint.decorator";
import { Body, Controller, Post } from "@nestjs/common";
import { CardSuggestionDto, GetCardSuggestionDto } from "./suggestion.dto";
import { SuggestionService } from "./suggestion.service";

@Controller("suggestion")
export class SuggestionController {
	constructor(private readonly suggestionService: SuggestionService) {}

	@ApiEndpoint({ type: CardSuggestionDto })
	@Post("card")
	async getCardSuggestion(@Body() dto: GetCardSuggestionDto) {
		return await this.suggestionService.getCardSuggestion(dto);
	}
}
