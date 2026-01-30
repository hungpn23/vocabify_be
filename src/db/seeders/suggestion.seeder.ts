import * as fs from "node:fs";
import * as path from "node:path";
import { CardSuggestion } from "@db/entities/card-suggestion.entity";
import { EntityManager } from "@mikro-orm/core";
import { Seeder } from "@mikro-orm/seeder";
import { EntryRecord } from "./type";

export class SuggestionSeeder extends Seeder {
	async run(em: EntityManager) {
		console.time("🌱 Seeding card suggestion");

		const DATA_PATH = path.join(process.cwd(), "data.json");

		const jsonData = fs.readFileSync(DATA_PATH, "utf-8");
		const data = JSON.parse(jsonData) as EntryRecord[];

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
