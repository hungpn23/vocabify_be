import { ApiEndpoint, RoleBaseAccessControl } from "@common/decorators";
import { SuccessResponseDto } from "@common/dtos";
import { UserRole } from "@common/enums";
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

	@RoleBaseAccessControl([UserRole.ADMIN])
	@ApiEndpoint({ type: SuccessResponseDto })
	@Post("embed")
	async embedData() {
		return await this.suggestionService.embedData();
	}

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
