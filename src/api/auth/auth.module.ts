import { QueueName } from "@common/enums/background.enum";
import { AuthConfig, authConfig } from "@config";
import { User } from "@db/entities/user.entity";
import { MailModule } from "@integrations/mail/mail.module";
import { MikroOrmModule } from "@mikro-orm/nestjs";
import { BullModule } from "@nestjs/bullmq";
import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";

@Module({
	imports: [
		JwtModule.registerAsync({
			inject: [authConfig.KEY],
			useFactory: (authConf: AuthConfig) => ({
				secret: authConf.jwtSecret,
				signOptions: {
					algorithm: authConf.jwtAlgorithm,
				},
			}),
		}),
		MikroOrmModule.forFeature([User]),
		BullModule.registerQueue({ name: QueueName.EMAIL }),
		MailModule,
	],
	controllers: [AuthController],
	providers: [AuthService],
})
export class AuthModule {}
