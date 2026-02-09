import { UserResponseDto } from "@api/user/user.res.dto";
import { ApiEndpoint, ApiEndpointPublic, User } from "@common/decorators";
import { SuccessResponseDto } from "@common/dtos";
import type { UserJwtPayload, UUID } from "@common/types";
import { Body, Controller, Get, Post, Query, Res } from "@nestjs/common";
import type { Response } from "express";
import {
	ChangePasswordDto,
	ConfirmEmailVerificationDto,
	LoginDto,
	RefreshTokenDto,
	RequestEmailVerificationDto,
	RequestMagicLinkDto,
	SignUpDto,
} from "./auth.dto";
import {
	ConfirmEmailVerificationResponseDto,
	TokenPairResponseDto,
} from "./auth.res.dto";
import { AuthService } from "./auth.service";

@Controller({ path: "auth" })
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@ApiEndpointPublic()
	@Get("google/callback")
	async googleCallback(@Query("code") code: string, @Res() res: Response) {
		return await this.authService.googleCallback(code, res);
	}

	@ApiEndpointPublic({ type: SuccessResponseDto })
	@Post("magic-link")
	async requestMagicLink(@Body() dto: RequestMagicLinkDto) {
		return await this.authService.requestMagicLink(dto);
	}

	@ApiEndpointPublic({ type: TokenPairResponseDto })
	@Post("verify-token")
	async verifyToken(@Query("token") token: string) {
		return await this.authService.verifyToken(token);
	}

	@ApiEndpoint({ type: UserResponseDto })
	@Get("session")
	async getSession(@User("userId") userId: UUID) {
		return await this.authService.getMyInfo(userId);
	}

	@ApiEndpointPublic({ type: TokenPairResponseDto })
	@Post("sign-up")
	async signUp(@Body() dto: SignUpDto) {
		return await this.authService.signUp(dto);
	}

	@ApiEndpointPublic({ type: TokenPairResponseDto })
	@Post("login")
	async login(@Body() dto: LoginDto) {
		return await this.authService.login(dto);
	}

	@ApiEndpoint({ type: SuccessResponseDto })
	@Post("logout")
	async logout(@User() payload: UserJwtPayload) {
		return await this.authService.logout(payload);
	}

	@ApiEndpointPublic({ type: TokenPairResponseDto })
	@Post("refresh")
	async refresh(@Body() dto: RefreshTokenDto) {
		return await this.authService.refresh(dto.refreshToken);
	}

	@ApiEndpoint({ type: SuccessResponseDto })
	@Post("password/change")
	async changePassword(
		@User("userId") userId: UUID,
		@Body() dto: ChangePasswordDto,
	) {
		return await this.authService.changePassword(userId, dto);
	}

	@ApiEndpointPublic({ type: SuccessResponseDto })
	@Post("email-verification/request")
	async requestEmailVerification(@Body() dto: RequestEmailVerificationDto) {
		return await this.authService.requestEmailVerification(dto);
	}

	@ApiEndpointPublic({ type: ConfirmEmailVerificationResponseDto })
	@Post("email-verification/confirm")
	async confirmEmailVerification(@Body() dto: ConfirmEmailVerificationDto) {
		return await this.authService.confirmEmailVerification(dto);
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
