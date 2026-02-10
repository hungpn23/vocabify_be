import { ClassValidator } from "@common/decorators";
import { CardAnswerDto } from "@modules/deck/dtos/card.dto";

export class SaveAnswersDto {
	@ClassValidator(CardAnswerDto, { isArray: true })
	answers!: CardAnswerDto[];
}
