import { CardAnswerDto } from "@api/deck/dtos/card.dto";
import { ClassValidator } from "@common/decorators";
import { Exclude, Expose } from "class-transformer";

export class SaveAnswersDto {
	@ClassValidator(CardAnswerDto, { isArray: true })
	answers!: CardAnswerDto[];
}

@Exclude()
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
