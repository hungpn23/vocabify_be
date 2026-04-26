import { Module } from "@nestjs/common";
import { AuthModule } from "./auth/auth.module";
import { DeckModule } from "./deck/deck.module";
import { ImageKitModule } from "./image-kit/image-kit.module";
import { MailModule } from "./mail/mail.module";
import { NotificationModule } from "./notification/notification.module";
import { RedisModule } from "./redis/redis.module";
import { StudyModule } from "./study/study.module";
import { StudyGroupModule } from "./study-group/study-group.module";
import { SuggestionModule } from "./suggestion/suggestion.module";
import { UserModule } from "./user/user.module";

@Module({
	imports: [
		RedisModule,
		ImageKitModule,
		MailModule,
		UserModule,
		AuthModule,
		DeckModule,
		StudyModule,
		SuggestionModule,
		NotificationModule,
		StudyGroupModule,
	],
})
export class Modules {}
