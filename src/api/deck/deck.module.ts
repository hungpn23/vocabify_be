import { NotificationModule } from "@api/notification/notification.module";
import { Card } from "@db/entities/card.entity";
import { Deck } from "@db/entities/deck.entity";
import { Notification } from "@db/entities/notification.entity";
import { User } from "@db/entities/user.entity";
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
