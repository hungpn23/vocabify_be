import { CardAnswerDto } from "@api/deck/dtos/card.dto";
import { ClassValidator } from "@common/decorators";

export class SaveAnswersDto {
	@ClassValidator(CardAnswerDto, { isArray: true })
	answers!: CardAnswerDto[];
}
