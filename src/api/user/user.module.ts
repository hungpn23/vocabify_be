import { QueueName } from "@common/enums/background.enum";
import { User } from "@db/entities/user.entity";
import { ImageKitModule } from "@integrations/imagekit/imagekit.module";
import { MikroOrmModule } from "@mikro-orm/nestjs";
import { BullModule } from "@nestjs/bullmq";
import { Module } from "@nestjs/common";
import { UserController } from "./user.controller";
import { UserProcessor } from "./user.processor";
import { UserService } from "./user.service";

@Module({
	imports: [
		ImageKitModule,
		MikroOrmModule.forFeature([User]),
		BullModule.registerQueue({ name: QueueName.IMAGE }),
	],
	controllers: [UserController],
	providers: [UserService, UserProcessor],
})
export class UserModule {}
