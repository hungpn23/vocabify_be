import { Module } from "@nestjs/common";
import { AuthModule } from "./auth/auth.module";
import { ImageKitModule } from "./image-kit/image-kit.module";
import { MailModule } from "./mail/mail.module";
import { NotificationModule } from "./notification/notification.module";
import { RedisModule } from "./redis/redis.module";
import { UserModule } from "./user/user.module";

@Module({
	imports: [
		RedisModule,
		ImageKitModule,
		MailModule,
		UserModule,
		AuthModule,
		NotificationModule,
	],
})
export class Modules {}
