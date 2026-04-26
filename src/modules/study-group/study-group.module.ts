import { Module } from "@nestjs/common";
import { StudyGroupGateway } from "./study-group.gateway";
import { StudyGroupService } from "./study-group.service";

@Module({
	providers: [StudyGroupService, StudyGroupGateway],
})
export class StudyGroupModule {}
