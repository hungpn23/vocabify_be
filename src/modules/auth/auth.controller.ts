import {
	ApiEndpoint,
	ApiEndpointPublic,
	UseCache,
	User,
} from "@common/decorators";
import { SuccessResponseDto } from "@common/dtos";
import type { UserJwtPayload, UUID } from "@common/types";
import { UserResponseDto } from "@modules/user/user.res.dto";
import { Body, Controller, Get, Post, Query, Res } from "@nestjs/common";
import type { Response } from "express";
import {
	ChangePasswordDto,
	ConfirmEmailVerificationDto,
	ConfirmPasswordResetDto,
	LoginDto,
	RefreshTokenDto,
	RequestEmailVerificationDto,
	RequestMagicLinkDto,
	RequestPasswordResetDto,
	ResetPasswordDto,
	SignUpDto,
} from "./auth.dto";
import {
	ConfirmEmailVerificationResponseDto,
	ConfirmPasswordResetResponseDto,
	TokenPairResponseDto,
} from "./auth.res.dto";
import { AuthService } from "./auth.service";

@Controller({ path: "auth" })
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@UseCache("no_cache")
	@ApiEndpointPublic()
	@Get("google/callback")
	async googleCallback(@Query("code") code: string, @Res() res: Response) {
		return await this.authService.googleCallback(code, res);
	}

	@ApiEndpointPublic({ responseType: SuccessResponseDto })
	@Post("magic-link")
	async requestMagicLink(@Body() dto: RequestMagicLinkDto) {
		return await this.authService.requestMagicLink(dto);
	}

	@ApiEndpointPublic({ responseType: TokenPairResponseDto })
	@Post("verify-token")
	async verifyToken(@Query("token") token: string) {
		return await this.authService.verifyToken(token);
	}

	@UseCache()
	@ApiEndpoint({ responseType: UserResponseDto })
	@Get("session")
	async getSession(@User("userId") userId: UUID) {
		return await this.authService.getMyInfo(userId);
	}

	@ApiEndpointPublic({ responseType: TokenPairResponseDto })
	@Post("sign-up")
	async signUp(@Body() dto: SignUpDto) {
		return await this.authService.signUp(dto);
	}

	@ApiEndpointPublic({ responseType: TokenPairResponseDto })
	@Post("login")
	async login(@Body() dto: LoginDto) {
		return await this.authService.login(dto);
	}

	@ApiEndpoint({ responseType: SuccessResponseDto })
	@Post("logout")
	async logout(@User() payload: UserJwtPayload) {
		return await this.authService.logout(payload);
	}

	@ApiEndpointPublic({ responseType: TokenPairResponseDto })
	@Post("refresh")
	async refresh(@Body() dto: RefreshTokenDto) {
		return await this.authService.refresh(dto.refreshToken);
	}

	@ApiEndpoint({ responseType: SuccessResponseDto })
	@Post("password/change")
	async changePassword(
		@User("userId") userId: UUID,
		@Body() dto: ChangePasswordDto,
	) {
		return await this.authService.changePassword(userId, dto);
	}

	@ApiEndpointPublic({ responseType: SuccessResponseDto })
	@Post("email-verification/request")
	async requestEmailVerification(@Body() dto: RequestEmailVerificationDto) {
		return await this.authService.requestEmailVerification(dto);
	}

	@ApiEndpointPublic({ responseType: ConfirmEmailVerificationResponseDto })
	@Post("email-verification/confirm")
	async confirmEmailVerification(@Body() dto: ConfirmEmailVerificationDto) {
		return await this.authService.confirmEmailVerification(dto);
	}

	@ApiEndpointPublic({ responseType: SuccessResponseDto })
	@Post("password/reset/request")
	async requestPasswordReset(@Body() dto: RequestPasswordResetDto) {
		return await this.authService.requestPasswordReset(dto);
	}

	@ApiEndpointPublic({ responseType: ConfirmPasswordResetResponseDto })
	@Post("password/reset/confirm")
	async confirmPasswordReset(@Body() dto: ConfirmPasswordResetDto) {
		return await this.authService.confirmPasswordReset(dto);
	}

	@ApiEndpointPublic({ responseType: SuccessResponseDto })
	@Post("password/reset")
	async resetPassword(@Body() dto: ResetPasswordDto) {
		return await this.authService.resetPassword(dto);
	}
}
