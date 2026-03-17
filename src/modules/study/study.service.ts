import { SuccessResponseDto } from "@common/dtos";
import { JobName, QueueName } from "@common/enums";
import { UpdateUserStatsData, type UUID } from "@common/types";
import { Card, Deck, UserStatistic } from "@db/entities";
import { EntityManager, EntityRepository, wrap } from "@mikro-orm/core";
import { InjectRepository } from "@mikro-orm/nestjs";
import { CardStatus } from "@modules/deck/deck.enum";
import { InjectQueue } from "@nestjs/bullmq";
import { Injectable, NotFoundException } from "@nestjs/common";
import { Queue } from "bullmq";
import { SaveAnswersDto } from "./study.dto";
import { UserStatsResponseDto } from "./study.res.dto";

@Injectable()
export class StudyService {
	constructor(
		private readonly em: EntityManager,
		@InjectRepository(Card)
		private readonly cardRepository: EntityRepository<Card>,
		@InjectRepository(Deck)
		private readonly deckRepository: EntityRepository<Deck>,
		@InjectRepository(UserStatistic)
		private readonly userStatsRepository: EntityRepository<UserStatistic>,

		@InjectQueue(QueueName.STUDY)
		private readonly studyQueue: Queue<UpdateUserStatsData, void, JobName>,
	) {}

	async getUserStats(userId: UUID): Promise<UserStatsResponseDto> {
		let stats = await this.userStatsRepository.findOne({ user: userId });

		if (!stats) {
			stats = this.userStatsRepository.create({ user: userId });
			await this.em.flush();
		}

		return wrap(stats).toObject();
	}

	async saveAnswers(userId: UUID, deckId: UUID, dto: SaveAnswersDto) {
		const deck = await this.deckRepository.findOne({
			id: deckId,
			owner: userId,
		});

		if (!deck) throw new NotFoundException();

		const cardsToUpdate = await this.cardRepository.find({
			id: dto.answers.map((a) => a.id),
			deck: deckId,
		});

		const map = new Map(cardsToUpdate.map((c) => [c.id, c]));

		for (const a of dto.answers) {
			const cardEntity = map.get(a.id);

			if (cardEntity) {
				this.cardRepository.assign(cardEntity, a);

				map.set(a.id, cardEntity);
			}
		}

		await this.em.flush();

		let learnedCount = 0;

		map.forEach((card) => {
			if ((card.status as CardStatus) === CardStatus.KNOWN) learnedCount += 1;
		});

		await this.studyQueue.add(JobName.UPDATE_USER_STATS, {
			userId,
			learnedCount,
		});

		return { success: true } satisfies SuccessResponseDto;
	}
}
