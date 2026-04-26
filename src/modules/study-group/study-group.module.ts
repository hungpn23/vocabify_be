import { Deck } from "@db/entities";
import { MikroOrmModule } from "@mikro-orm/nestjs";
import { Module } from "@nestjs/common";
import { StudyGroupGateway } from "./study-group.gateway";
import { StudyGroupService } from "./study-group.service";

@Module({
	imports: [MikroOrmModule.forFeature([Deck])],
	providers: [StudyGroupService, StudyGroupGateway],
})
export class StudyGroupModule {}
