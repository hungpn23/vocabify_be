import { Module } from "@nestjs/common";
import { ImageKitModule } from "./imagekit/imagekit.module";
import { MailModule } from "./mail/mail.module";

@Module({
	imports: [ImageKitModule, MailModule],
})
export class IntegrationModule {}
