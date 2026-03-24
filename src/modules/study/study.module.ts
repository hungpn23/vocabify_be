import { QueueName } from "@common/enums";
import { Card, Deck, UserStatistic } from "@db/entities";
import { MikroOrmModule } from "@mikro-orm/nestjs";
import { BullModule } from "@nestjs/bullmq";
import { Module } from "@nestjs/common";
import { StudyConsumer } from "./study.consumer";
import { StudyController } from "./study.controller";
import { StudyService } from "./study.service";

@Module({
	imports: [
		MikroOrmModule.forFeature([Deck, Card, UserStatistic]),
		BullModule.registerQueue({
			name: QueueName.STUDY,
			defaultJobOptions: {
				removeOnComplete: true,
			},
		}),
	],
	controllers: [StudyController],
	providers: [StudyService, StudyConsumer],
})
export class StudyModule {}
