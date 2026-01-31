import { UserDto } from "@api/user/user.dto";
import { ApiEndpoint, ApiEndpointPublic, User } from "@common/decorators";
import { SuccessResponseDto } from "@common/dtos";
import type { UserJwtPayload, UUID } from "@common/types";
import { Body, Controller, Get, Post, Query, Res } from "@nestjs/common";
import type { Response } from "express";
import {
	ChangePasswordDto,
	LoginDto,
	RefreshTokenDto,
	RefreshTokenResponseDto,
	RegisterDto,
	TokenPairDto,
} from "./auth.dto";
import { AuthService } from "./auth.service";

@Controller({ path: "auth" })
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@ApiEndpointPublic()
	@Get("google/callback")
	async googleCallback(@Query("code") code: string, @Res() res: Response) {
		return await this.authService.googleCallback(code, res);
	}

	@ApiEndpointPublic({ type: TokenPairDto })
	@Post("oauth2/verify")
	async verifyToken(@Query("token") token: string) {
		return await this.authService.verifyToken(token);
	}

	@ApiEndpoint({ type: UserDto })
	@Get("session")
	async getSession(@User("userId") userId: UUID) {
		return await this.authService.getMyInfo(userId);
	}

	@ApiEndpointPublic({ type: TokenPairDto })
	@Post("register")
	async register(@Body() dto: RegisterDto) {
		return await this.authService.register(dto);
	}

	@ApiEndpointPublic({ type: TokenPairDto })
	@Post("login")
	async login(@Body() dto: LoginDto) {
		return await this.authService.login(dto);
	}

	@ApiEndpoint({ type: SuccessResponseDto })
	@Post("logout")
	async logout(@User() payload: UserJwtPayload) {
		return await this.authService.logout(payload);
	}

	@ApiEndpointPublic({ type: RefreshTokenResponseDto })
	@Post("refresh")
	async refresh(@Body() dto: RefreshTokenDto) {
		return await this.authService.refresh(dto.refreshToken);
	}

	@ApiEndpoint()
	@Post("password/change")
	async changePassword(
		@User("userId") userId: UUID,
		@Body() dto: ChangePasswordDto,
	) {
		return await this.authService.changePassword(userId, dto);
	}

	// TODO auth api
	// @Post('forgot-password')
	// async forgotPassword() {
	//   return 'forgot-password';
	// }

	// @Post('verify/forgot-password')
	// async verifyForgotPassword() {
	//   return 'verify-forgot-password';
	// }

	// @Get('verify/email')
	// async verifyEmail() {
	//   return 'verify-email';
	// }

	// @Post('verify/email/resend')
	// async resendVerifyEmail() {
	//   return 'resend-verify-email';
	// }
}
