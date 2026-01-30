import { QueueName } from "@common/enums/queue-name.enum";
import { BullModule } from "@nestjs/bullmq";
import { Module } from "@nestjs/common";
import { ResendProcessor } from "./resend.processor";
import { ResendService } from "./resend.service";

@Module({
	imports: [BullModule.registerQueue({ name: QueueName.EMAIL })],
	providers: [ResendService, ResendProcessor],
})
export class ResendModule {}
