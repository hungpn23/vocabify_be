import { Exclude, Expose } from "class-transformer";

@Exclude()
export class UserStatsResponseDto {
	@Expose()
	currentStreak!: number;

	@Expose()
	longestStreak!: number;

	@Expose()
	totalCardsLearned!: number;

	@Expose()
	masteryRate!: number;
}
