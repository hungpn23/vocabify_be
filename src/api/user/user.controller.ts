import { ApiEndpoint, ApiFile, User } from "@common/decorators";
import { validateImagePipe } from "@common/pipes";
import { type UUID } from "@common/types";
import { multerStorage } from "@common/utils";
import { Controller, Post, UploadedFile } from "@nestjs/common";
import { UploadAvatarResponseDto } from "./user.res.dto";
import { UserService } from "./user.service";

@Controller("users")
export class UserController {
	constructor(private readonly userService: UserService) {}

	@ApiFile("avatar", { storage: multerStorage() })
	@ApiEndpoint({ type: UploadAvatarResponseDto })
	@Post("upload-avatar")
	async uploadAvatar(
		@UploadedFile(validateImagePipe())
		file: Express.Multer.File,
		@User("userId") userId: UUID,
	) {
		return await this.userService.uploadAvatar(userId, file);
	}
}
