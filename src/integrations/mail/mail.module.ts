import { QueueName } from "@common/enums/queue-name.enum";
import { BullModule } from "@nestjs/bullmq";
import { Module } from "@nestjs/common";
import { MailService } from "./mail.service";

@Module({
	imports: [BullModule.registerQueue({ name: QueueName.EMAIL })],
	providers: [MailService],
})
export class MailModule {}
