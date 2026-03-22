import { Notification } from "@db/entities";
import { MikroOrmModule } from "@mikro-orm/nestjs";
import { Module } from "@nestjs/common";
import { NotificationController } from "./notification.controller";
import { NotificationGateway } from "./notification.gateway";
import { NotificationService } from "./notification.service";

@Module({
	imports: [MikroOrmModule.forFeature([Notification])],
	controllers: [NotificationController],
	providers: [NotificationService, NotificationGateway],
	exports: [NotificationGateway],
})
export class NotificationModule {}
