import { QueueName } from "@common/enums";
import { User } from "@db/entities";
import { MikroOrmModule } from "@mikro-orm/nestjs";
import { ImageKitModule } from "@modules/image-kit/image-kit.module";
import { BullModule } from "@nestjs/bullmq";
import { Module } from "@nestjs/common";
import { UserConsumer } from "./user.consumer";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";

@Module({
	imports: [
		ImageKitModule,
		MikroOrmModule.forFeature([User]),
		BullModule.registerQueue({ name: QueueName.IMAGE }),
	],
	controllers: [UserController],
	providers: [UserService, UserConsumer],
})
export class UserModule {}
