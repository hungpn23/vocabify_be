import { ApiEndpoint, ApiFile, User } from "@common/decorators";
import { SuccessResponseDto } from "@common/dtos";
import { validateImagePipe } from "@common/pipes";
import { type UUID } from "@common/types";
import { multerStorage } from "@common/utils";
import {
	Body,
	Controller,
	Delete,
	Param,
	Patch,
	Post,
	UploadedFile,
} from "@nestjs/common";
import { UpdateProfileDto } from "./user.dto";
import { UserService } from "./user.service";

@Controller("users")
export class UserController {
	constructor(private readonly userService: UserService) {}

	@ApiEndpoint({ responseType: SuccessResponseDto })
	@Patch("profile")
	async updateProfile(
		@User("userId") userId: UUID,
		@Body() dto: UpdateProfileDto,
	) {
		return await this.userService.updateProfile(userId, dto);
	}

	@ApiFile("avatar", { storage: multerStorage("avatars") })
	@ApiEndpoint({ responseType: SuccessResponseDto })
	@Post("avatar")
	async uploadAvatar(
		@UploadedFile(validateImagePipe())
		file: Express.Multer.File,
		@User("userId") userId: UUID,
	) {
		return await this.userService.uploadAvatar(userId, file);
	}

	@ApiEndpoint({ responseType: SuccessResponseDto })
	@Delete("avatar/:fileId")
	async deleteAvatar(
		@User("userId") userId: UUID,
		@Param("fileId") fileId: string,
	) {
		return await this.userService.deleteAvatar(userId, fileId);
	}
}
