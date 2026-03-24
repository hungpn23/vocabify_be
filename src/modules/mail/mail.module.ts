import { QueueName } from "@common/enums";
import { BullModule } from "@nestjs/bullmq";
import { Module } from "@nestjs/common";
import { MailConsumer } from "./mail.consumer";
import { MailProducer } from "./mail.producer";
import { MailService } from "./mail.service";

@Module({
	imports: [BullModule.registerQueue({ name: QueueName.EMAIL })],
	providers: [MailService, MailConsumer, MailProducer],
	exports: [MailProducer],
})
export class MailModule {}
