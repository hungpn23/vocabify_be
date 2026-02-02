import { getSampleData } from "@common/utils";
import { CardSuggestion } from "@db/entities";
import { EntityManager } from "@mikro-orm/core";
import { Seeder } from "@mikro-orm/seeder";

export class SuggestionSeeder extends Seeder {
	async run(em: EntityManager) {
		console.time("🌱 Seeding card suggestion");

		const data = getSampleData();

		const batchSize = 1000;
		for (let i = 0; i < data.length; i += batchSize) {
			const batch = data.slice(i, i + batchSize);

			for (const item of batch) {
				const { term, termLanguageCode, definitionVi, type, exampleEn } = item;

				em.create(CardSuggestion, {
					term: term,
					termLanguage: termLanguageCode,
					definition: definitionVi,
					definitionLanguage: "vi",
					pronunciation: type === "word" ? item.pronunciation : undefined,
					partOfSpeech: type === "word" ? item.pos : undefined,
					usageOrGrammar: type === "phrase" ? item.usageOrGrammar : undefined,
					examples: exampleEn ? [exampleEn] : [],
				});
			}
		}

		await em.flush();

		console.timeEnd("🌱 Seeding card suggestion");
	}
}
