import { StringValidator } from "@common/decorators";

export class AnswerCardDto {
	@StringValidator()
	roomId!: string;

	@StringValidator({ isUUID: true })
	cardId!: string;

	// Can be string (written) or number (MCQ index) — validated in service
	answer!: string | number;

	@StringValidator()
	questionType!: string;
}
