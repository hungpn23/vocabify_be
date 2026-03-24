import { StringValidator } from "@common/decorators";

export class UpdateProfileDto {
	@StringValidator()
	username!: string;
}
