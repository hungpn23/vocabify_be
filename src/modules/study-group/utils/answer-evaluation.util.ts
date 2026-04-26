const SIMILARITY_THRESHOLD = { WORD: 0.75, SENTENCE: 0.75 };

type AnswerStatus = "correct" | "typo" | "almost" | "incorrect";

export function evaluateAnswer(
	userAnswer: string | number,
	correctAnswer: string,
	questionType: "multiple_choices" | "written",
	correctChoiceIndex?: number,
): { status: AnswerStatus; isCorrect: boolean } {
	if (questionType === "multiple_choices") {
		const isCorrect = userAnswer === correctChoiceIndex;
		return { status: isCorrect ? "correct" : "incorrect", isCorrect };
	}

	if (typeof userAnswer !== "string") {
		return { status: "incorrect", isCorrect: false };
	}

	const result = evaluateWrittenAnswer(userAnswer, correctAnswer);
	const isCorrect =
		result.status === "correct" ||
		result.status === "typo" ||
		result.status === "almost";
	return { status: result.status, isCorrect };
}

function evaluateWrittenAnswer(
	userInput: string,
	correctAnswer: string,
): { status: AnswerStatus } {
	const isWord = userInput.split(/\s+/).filter(Boolean).length <= 1;

	if (isWord) {
		if (userInput.length <= 3 && userInput !== correctAnswer) {
			return { status: "incorrect" };
		}
		const similarity = evaluateWordSimilarity(userInput, correctAnswer);
		return { status: similarity.status };
	}

	const similarity = evaluateSentenceSimilarity(userInput, correctAnswer);
	return { status: similarity.status };
}

function evaluateWordSimilarity(
	inputWord: string,
	correctWord: string,
): { score: number; status: "correct" | "typo" | "incorrect" } {
	if (inputWord === correctWord) return { score: 1, status: "correct" };
	if (!inputWord.length || !correctWord.length)
		return { score: 0, status: "incorrect" };

	const distance = getLevenshteinDistance(inputWord, correctWord);
	const score = 1 - distance / Math.max(inputWord.length, correctWord.length);

	let status: "correct" | "typo" | "incorrect";
	if (score === 1) status = "correct";
	else if (score >= SIMILARITY_THRESHOLD.WORD) status = "typo";
	else status = "incorrect";

	return { score, status };
}

function evaluateSentenceSimilarity(
	userInput: string,
	correctAnswer: string,
): { score: number; status: "correct" | "almost" | "incorrect" } {
	const inputWords = userInput.split(/\s+/).filter(Boolean);
	const correctWords = correctAnswer.split(/\s+/).filter(Boolean);

	if (!inputWords.length || !correctWords.length) {
		return { score: 0, status: "incorrect" };
	}

	const matchedIndexes = new Set<number>();
	let matchedCount = 0;

	for (const inputWord of inputWords) {
		let bestScore = -1;
		let bestIndex = -1;

		correctWords.forEach((correctWord, idx) => {
			if (matchedIndexes.has(idx)) return;
			const sim = evaluateWordSimilarity(inputWord, correctWord);
			if (sim.score > bestScore) {
				bestScore = sim.score;
				bestIndex = idx;
			}
		});

		if (bestScore >= SIMILARITY_THRESHOLD.WORD && bestIndex >= 0) {
			matchedIndexes.add(bestIndex);
			matchedCount++;
		}
	}

	const score = (2 * matchedCount) / (inputWords.length + correctWords.length);

	let status: "correct" | "almost" | "incorrect";
	if (score === 1) status = "correct";
	else if (score >= SIMILARITY_THRESHOLD.SENTENCE) status = "almost";
	else status = "incorrect";

	return { score, status };
}

function getLevenshteinDistance(a: string, b: string): number {
	const rowCount = a.length;
	const colCount = b.length;
	const table: number[][] = Array.from({ length: rowCount }, () =>
		new Array(colCount).fill(0),
	);

	for (let i = 0; i < rowCount; i++) table[i]![0] = i;
	for (let j = 0; j < colCount; j++) table[0]![j] = j;

	for (let i = 1; i < rowCount; i++) {
		for (let j = 1; j < colCount; j++) {
			const cost = a[i - 1] === b[j - 1] ? 0 : 1;
			table[i]![j] = Math.min(
				table[i - 1]![j]! + 1,
				table[i]![j - 1]! + 1,
				table[i - 1]![j - 1]! + cost,
			);
		}
	}

	return table[rowCount - 1]![colCount - 1]!;
}
