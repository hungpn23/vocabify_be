import { Card, Deck, Notification, PendingMedia, User } from "@db/entities";
import { MikroOrmModule } from "@mikro-orm/nestjs";
import { ImageKitModule } from "@modules/image-kit/image-kit.module";
import { NotificationModule } from "@modules/notification/notification.module";
import { Module } from "@nestjs/common";
import { DeckController } from "./deck.controller";
import { DeckService } from "./deck.service";
import { PendingMediaService } from "./pending-media.service";

@Module({
	imports: [
		MikroOrmModule.forFeature([Deck, Card, User, Notification, PendingMedia]),
		ImageKitModule,
		NotificationModule,
	],
	controllers: [DeckController],
	providers: [DeckService, PendingMediaService],
})
export class DeckModule {}
