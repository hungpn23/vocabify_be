import { CardAnswerDto } from "@api/deck/dtos/card.dto";
import { ClassValidator } from "@common/decorators";
import { Expose } from "class-transformer";

export class SaveAnswersDto {
	@ClassValidator(CardAnswerDto, { isArray: true })
	answers!: CardAnswerDto[];
}

export class UserStatsDto {
	@Expose()
	currentStreak!: number;

	@Expose()
	longestStreak!: number;

	@Expose()
	totalCardsLearned!: number;

	@Expose()
	masteryRate!: number;
}
