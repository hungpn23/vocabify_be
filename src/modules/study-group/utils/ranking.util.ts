import type {
	PlayerInfo,
	PlayerProgress,
	ProgressData,
	Ranking,
} from "../study-group.type";

export function calculateRankings(
	players: Record<string, PlayerInfo>,
	progress: Record<string, ProgressData>,
	totalCards: number,
	startedAt: string,
): Ranking[] {
	const now = Date.now();
	const startTime = new Date(startedAt).getTime();

	const rankings: Ranking[] = Object.entries(players).map(
		([userId, player]) => {
			const prog = progress[userId] ?? {
				completed: 0,
				correct: 0,
				incorrect: 0,
				finishedAt: null,
			};
			const finished = prog.completed >= totalCards;
			const totalAnswers = prog.correct + prog.incorrect;
			const accuracy =
				totalAnswers > 0 ? Math.round((prog.correct / totalAnswers) * 100) : 0;
			const endTime = prog.finishedAt
				? new Date(prog.finishedAt).getTime()
				: now;
			const timeSeconds = Math.round((endTime - startTime) / 1000);

			return {
				rank: 0,
				userId: userId as Ranking["userId"],
				username: player.username,
				avatar: player.avatar,
				completed: prog.completed,
				correct: prog.correct,
				incorrect: prog.incorrect,
				accuracy,
				timeSeconds,
				finished,
			};
		},
	);

	rankings.sort((a, b) => {
		if (a.finished !== b.finished) return a.finished ? -1 : 1;
		if (a.completed !== b.completed) return b.completed - a.completed;
		if (a.accuracy !== b.accuracy) return b.accuracy - a.accuracy;
		return a.timeSeconds - b.timeSeconds;
	});

	rankings.forEach((r, i) => {
		r.rank = i + 1;
	});

	return rankings;
}
