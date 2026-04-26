export enum RoomStatus {
	WAITING = "waiting",
	COUNTDOWN = "countdown",
	PLAYING = "playing",
	FINISHED = "finished",
}

export enum EndCondition {
	FIRST_FINISH = "first_finish",
	TIME_LIMIT = "time_limit",
	ALL_FINISH = "all_finish",
}

export enum QuestionType {
	MCQ = "multiple_choices",
	WRITTEN = "written",
	BOTH = "both",
}
