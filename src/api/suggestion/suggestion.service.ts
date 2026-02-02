import { SuccessResponseDto } from "@common/dtos";
import { EntryRecord } from "@common/types";
import { getSampleData, parseStringValueToSeconds } from "@common/utils";
import {
	type IntegrationConfig,
	integrationConfig,
	type VectorDbConfig,
	vectorDbConfig,
} from "@config";
import { CardSuggestion } from "@db/entities";
import { CohereEmbeddings } from "@langchain/cohere";
import { Document } from "@langchain/core/documents";
import { QdrantVectorStore } from "@langchain/qdrant";
import { EntityRepository, wrap } from "@mikro-orm/core";
import { InjectRepository } from "@mikro-orm/nestjs";
import {
	BadRequestException,
	Inject,
	Injectable,
	Logger,
	NotFoundException,
	OnModuleInit,
} from "@nestjs/common";
import { RedisService } from "@redis/redis.service";
import {
	GetNextCardSuggestionDto,
	GetTermSuggestionDto,
} from "./suggestion.dto";
import {
	NextCardSuggestionResponseDto,
	TermSuggestionResponseDto,
} from "./suggestion.res.dto";
import { SearchResult } from "./suggestion.type";

@Injectable()
export class SuggestionService implements OnModuleInit {
	private readonly logger = new Logger(SuggestionService.name);
	private readonly model: CohereEmbeddings;
	private _store?: QdrantVectorStore;

	constructor(
		private readonly redisService: RedisService,
		@InjectRepository(CardSuggestion)
		private readonly cardSuggestionRepository: EntityRepository<CardSuggestion>,
		@Inject(integrationConfig.KEY)
		private readonly integrationConf: IntegrationConfig,
		@Inject(vectorDbConfig.KEY)
		private readonly vectorDbConf: VectorDbConfig,
	) {
		this.model = new CohereEmbeddings({
			model: "embed-multilingual-v3.0",
			apiKey: this.integrationConf.cohereApiKey,
		});
	}

	/**
	 * @see https://docs.nestjs.com/fundamentals/lifecycle-events
	 */
	async onModuleInit() {
		const { host, port, collectionName } = this.vectorDbConf;

		this._store = await QdrantVectorStore.fromExistingCollection(this.model, {
			url: `http://${host}:${port}`,
			collectionName,
		});

		this.logger.debug("VectorStore initialized.");
	}

	get store() {
		if (!this._store) {
			throw new BadRequestException("VectorStore not initialized");
		}

		return this._store;
	}

	async suggestDefinition({ partOfSpeech, ...rest }: GetTermSuggestionDto) {
		const where: GetTermSuggestionDto = rest;
		if (partOfSpeech) where.partOfSpeech = partOfSpeech;

		const cachedSuggestion =
			await this.redisService.getValue<TermSuggestionResponseDto>(
				this.redisService.getSuggestionKey(where),
			);

		if (cachedSuggestion) {
			this.logger.debug("Found cached suggestion");
			return cachedSuggestion satisfies TermSuggestionResponseDto;
		}

		const suggestion = await this.cardSuggestionRepository.findOne(where);
		if (!suggestion) throw new NotFoundException();

		const suggestionDto = wrap(
			suggestion,
		).toPOJO() satisfies TermSuggestionResponseDto;

		await this.redisService.setValue(
			this.redisService.getSuggestionKey(where),
			suggestionDto,
			parseStringValueToSeconds("5m"),
		);

		return suggestionDto;
	}

	async suggestNextCard(dto: GetNextCardSuggestionDto, k: number = 2) {
		const query = `${dto.term} ${dto.definition}`;

		const records = await this._similaritySearch(query, k);

		const cards = await this.cardSuggestionRepository.find({
			term: { $in: records.map((r) => r.term) },
			termLanguage: { $in: records.map((r) => r.termLanguageCode) },
		});

		return cards.map((c) =>
			wrap(c).toPOJO(),
		) satisfies NextCardSuggestionResponseDto[];
	}

	async embedData() {
		const documents = getSampleData().map((d) => this._buildDocument(d));

		const batchSize = 1000;
		for (let i = 0; i < documents.length; i += batchSize) {
			const batch = documents.slice(i, i + batchSize);
			this.logger.debug(
				`Embedding batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(documents.length / batchSize)}`,
			);
			await this.store.addDocuments(batch);
		}

		this.logger.debug(`Total ${documents.length} documents embedded.`);
		return { success: true } satisfies SuccessResponseDto;
	}

	private async _similaritySearch(query: string, k: number) {
		const points = (await this.store.similaritySearch(
			query,
			k,
		)) as SearchResult[];

		return points.map((p) => p.metadata);
	}

	private _buildDocument(record: EntryRecord) {
		const { term, termLanguageCode, definitionEn, definitionVi, exampleEn } =
			record;

		const parts: string[] = [];

		parts.push(`Term in ${termLanguageCode}: ${term}`);
		parts.push(`Definition in English: ${definitionEn}`);
		parts.push(`Definition in Vietnamese: ${definitionVi}`);
		parts.push(`Example in English: ${exampleEn}`);

		return new Document({
			pageContent: parts.join("\n"),
			metadata: record,
		});
	}
}
