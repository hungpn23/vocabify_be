import { QueueName } from "@common/enums";
import { BullModule } from "@nestjs/bullmq";
import { Module } from "@nestjs/common";
import { MailProcessor } from "./mail.consumer";
import { MailProducer } from "./mail.producer";
import { MailService } from "./mail.service";

@Module({
	imports: [BullModule.registerQueue({ name: QueueName.EMAIL })],
	providers: [MailService, MailProcessor, MailProducer],
	exports: [MailProducer],
})
export class MailModule {}
