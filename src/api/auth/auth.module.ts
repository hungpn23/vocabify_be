import { QueueName } from "@common/enums/background.enum";
import { Session } from "@db/entities/session.entity";
import { User } from "@db/entities/user.entity";
import { MikroOrmModule } from "@mikro-orm/nestjs";
import { BullModule } from "@nestjs/bullmq";
import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";

@Module({
	imports: [
		JwtModule.register({}),
		MikroOrmModule.forFeature([User, Session]),
		BullModule.registerQueue({ name: QueueName.EMAIL }),
	],
	controllers: [AuthController],
	providers: [AuthService],
})
export class AuthModule {}
