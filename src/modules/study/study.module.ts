import { QueueName } from "@common/enums";
import { Card, Deck, UserStatistic } from "@db/entities";
import { MikroOrmModule } from "@mikro-orm/nestjs";
import { BullModule } from "@nestjs/bullmq";
import { Module } from "@nestjs/common";
import { StudyController } from "./study.controller";
import { StudyProcessor } from "./study.processor";
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
	providers: [StudyService, StudyProcessor],
})
export class StudyModule {}
