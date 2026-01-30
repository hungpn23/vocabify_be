import { CardStatus } from "@api/deck/deck.enum";
import { JobName, QueueName } from "@common/enums/background.enum";
import { UpdateUserStatsData } from "@common/types/jobs.type";
import { Card } from "@db/entities/card.entity";
import { UserStatistic } from "@db/entities/user-statistics.entity";
import { EntityManager } from "@mikro-orm/core";
import { OnWorkerEvent, Processor, WorkerHost } from "@nestjs/bullmq";
import { Logger } from "@nestjs/common";
import { Job } from "bullmq";
import { differenceInCalendarDays } from "date-fns";

@Processor(QueueName.STUDY)
export class StudyProcessor extends WorkerHost {
	private readonly logger = new Logger(StudyProcessor.name);

	constructor(private readonly em: EntityManager) {
		super();
	}

	async process(job: Job<UpdateUserStatsData, void, JobName>) {
		this.logger.debug(`Processing job ${job.id} of type ${job.name}...`);

		const { userId, learnedCount } = job.data;
		const em = this.em.fork();
		const userStatsRepository = em.getRepository(UserStatistic);
		const cardRepository = em.getRepository(Card);

		try {
			if (job.name === JobName.UPDATE_USER_STATS) {
				const now = new Date();

				let stats = await userStatsRepository.findOne({
					user: userId,
				});

				if (!stats) {
					stats = userStatsRepository.create({ user: userId });
				}

				// update streaks
				if (stats.lastStudyDate) {
					const daysDiff = differenceInCalendarDays(now, stats.lastStudyDate);
					if (daysDiff === 1) {
						stats.currentStreak += 1;
					} else if (daysDiff > 1) {
						stats.currentStreak = 1;
					}
				} else {
					stats.currentStreak = 1;
				}

				// update longest streak
				if (stats.currentStreak > stats.longestStreak) {
					stats.longestStreak = stats.currentStreak;
				}

				// update last study date and total cards learned
				stats.lastStudyDate = now;
				stats.totalCardsLearned += learnedCount;

				// update mastery rate
				const [currentKnownCards, totalCards] = await Promise.all([
					cardRepository.count({
						deck: { owner: userId },
						status: CardStatus.KNOWN,
					}),

					cardRepository.count({
						deck: { owner: userId },
					}),
				]);

				stats.masteryRate =
					totalCards > 0
						? Math.round((currentKnownCards / totalCards) * 100)
						: 0;

				await em.flush();

				this.logger.debug(
					`Successfully processed study stats for user ${userId}.`,
				);
			}
		} catch (error) {
			this.logger.error(
				`Failed to process study stats for user ${userId}:`,
				error,
			);

			throw error;
		}
	}

	@OnWorkerEvent("active")
	onActive(job: Job) {
		this.logger.debug(`Job ${job.id} is now active`);
	}

	@OnWorkerEvent("progress")
	onProgress(job: Job) {
		this.logger.debug(`Job ${job.id} is ${+job.progress}% complete`);
	}

	@OnWorkerEvent("completed")
	onCompleted(job: Job) {
		this.logger.debug(`Job ${job.id} has been completed`);
	}

	@OnWorkerEvent("failed")
	onFailed(job: Job) {
		this.logger.error(
			`Job ${job.id} has failed with reason: ${job.failedReason}`,
		);
		this.logger.error(job.stacktrace);
	}

	@OnWorkerEvent("stalled")
	onStalled(job: Job) {
		this.logger.error(`Job ${job.id} has been stalled`);
	}

	@OnWorkerEvent("error")
	onError(job: Job, error: Error) {
		this.logger.error(`Job ${job.id} has failed with error: ${error.message}`);
	}
}
