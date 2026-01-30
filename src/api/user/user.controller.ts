import { ApiEndpoint } from "@common/decorators/api-endpoint.decorator";
import { ApiFile } from "@common/decorators/api-file.decorator";
import { User } from "@common/decorators/user.decorator";
import { validateImagePipe } from "@common/pipes/validate-image.pipe";
import { type UUID } from "@common/types/branded.type";
import { multerStorage } from "@common/utils/multer-storage";
import { Controller, Post, UploadedFile } from "@nestjs/common";
import { UploadAvatarDto } from "./user.dto";
import { UserService } from "./user.service";

@Controller("users")
export class UserController {
	constructor(private readonly userService: UserService) {}

	@ApiFile("avatar", { storage: multerStorage() })
	@ApiEndpoint({ type: UploadAvatarDto })
	@Post("upload-avatar")
	async uploadAvatar(
		@UploadedFile(validateImagePipe())
		file: Express.Multer.File,
		@User("userId") userId: UUID,
	) {
		return await this.userService.uploadAvatar(userId, file);
	}
}
