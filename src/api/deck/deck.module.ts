import { NotificationModule } from "@api/notification/notification.module";
import { Card, Deck, Notification, User } from "@db/entities";
import { MikroOrmModule } from "@mikro-orm/nestjs";
import { Module } from "@nestjs/common";
import { DeckController } from "./deck.controller";
import { DeckService } from "./deck.service";

@Module({
	imports: [
		MikroOrmModule.forFeature([Deck, Card, User, Notification]),
		NotificationModule,
	],
	controllers: [DeckController],
	providers: [DeckService],
})
export class DeckModule {}
