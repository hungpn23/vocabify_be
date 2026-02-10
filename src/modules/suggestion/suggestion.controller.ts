import { ApiEndpoint, RoleBaseAccessControl } from "@common/decorators";
import { SuccessResponseDto } from "@common/dtos";
import { UserRole } from "@common/enums";
import { Body, Controller, Post } from "@nestjs/common";
import {
	GetNextCardSuggestionDto,
	GetTermSuggestionDto,
} from "./suggestion.dto";
import {
	NextCardSuggestionResponseDto,
	TermSuggestionResponseDto,
} from "./suggestion.res.dto";
import { SuggestionService } from "./suggestion.service";

@Controller("suggestion")
export class SuggestionController {
	constructor(private readonly suggestionService: SuggestionService) {}

	@RoleBaseAccessControl([UserRole.ADMIN])
	@ApiEndpoint({ type: SuccessResponseDto })
	@Post("embed-data")
	async embedData() {
		return await this.suggestionService.embedData();
	}

	@ApiEndpoint({ type: TermSuggestionResponseDto })
	@Post("term")
	async getTermSuggestion(@Body() dto: GetTermSuggestionDto) {
		return await this.suggestionService.suggestDefinition(dto);
	}

	@ApiEndpoint({ type: NextCardSuggestionResponseDto })
	@Post("next-card")
	async getNextCardSuggestion(@Body() dto: GetNextCardSuggestionDto) {
		return await this.suggestionService.suggestNextCard(dto);
	}
}
