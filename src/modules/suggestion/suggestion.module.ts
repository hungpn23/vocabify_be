import { CardSuggestion } from "@db/entities";
import { MikroOrmModule } from "@mikro-orm/nestjs";
import { Module } from "@nestjs/common";
import { SuggestionController } from "./suggestion.controller";
import { SuggestionService } from "./suggestion.service";

@Module({
	imports: [MikroOrmModule.forFeature([CardSuggestion])],
	controllers: [SuggestionController],
	providers: [SuggestionService],
})
export class SuggestionModule {}
