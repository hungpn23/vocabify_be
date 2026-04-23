import { randomInt } from "node:crypto";
import { RATE_LIMIT } from "@common/constants";
import { SuccessResponseDto } from "@common/dtos";
import { JwtToken, UserAction, UserRole } from "@common/enums";
import {
	GoogleJwtPayload,
	GoogleTokenResponse,
	UserJwtPayload,
	type UUID,
} from "@common/types";
import {
	createUUID,
	getEmailVerificationKey,
	getPasswordResetKey,
	getResetPasswordSessionKey,
	getSignUpSessionKey,
	getUserSessionKey,
	getVerificationTokenKey,
	parseStringValueToSeconds,
} from "@common/utils";
import {
	type AppConfig,
	type AuthConfig,
	appConfig,
	authConfig,
	type GoogleConfig,
	googleConfig,
} from "@config";
import { User } from "@db/entities";
import { EntityManager, EntityRepository, wrap } from "@mikro-orm/core";
import { InjectRepository } from "@mikro-orm/nestjs";
import { MailProducer } from "@modules/mail/mail.producer";
import { RedisService } from "@modules/redis/redis.service";
import { UserResponseDto } from "@modules/user/user.res.dto";
import {
	BadRequestException,
	Inject,
	Injectable,
	UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import argon2 from "argon2";
import { Response } from "express";
import { pick } from "lodash";
import { generateFromEmail } from "unique-username-generator";
import {
	ChangePasswordDto,
	ConfirmEmailVerificationDto,
	ConfirmPasswordResetDto,
	LoginDto,
	RequestEmailVerificationDto,
	RequestMagicLinkDto,
	RequestPasswordResetDto,
	ResetPasswordDto,
	SignUpDto,
} from "./auth.dto";
import { OtpData } from "./auth.interface";
import {
	ConfirmEmailVerificationResponseDto,
	ConfirmPasswordResetResponseDto,
	TokenPairResponseDto,
} from "./auth.res.dto";

type CreateTokenPairOptions = {
	userId: UUID;
	sessionId: UUID;
	role: UserRole;
};

@Injectable()
export class AuthService {
	constructor(
		private readonly jwtService: JwtService,
		private readonly em: EntityManager,
		private readonly mailProducer: MailProducer,
		private readonly redisService: RedisService,
		@Inject(authConfig.KEY)
		private readonly authConf: AuthConfig,
		@Inject(appConfig.KEY)
		private readonly appConf: AppConfig,
		@Inject(googleConfig.KEY)
		private readonly googleConf: GoogleConfig,
		@InjectRepository(User)
		private readonly userRepository: EntityRepository<User>,
	) {}

	async googleCallback(code: string, res: Response) {
		const params = new URLSearchParams({
			code,
			client_id: this.googleConf.clientId,
			client_secret: this.googleConf.clientSecret,
			redirect_uri: this.googleConf.redirectUri,
			grant_type: "authorization_code",
		}).toString();

		const response = await fetch(
			`https://oauth2.googleapis.com/token?${params}`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/x-www-form-urlencoded",
				},
			},
		);

		const { id_token } = (await response.json()) as GoogleTokenResponse;
		const { email } = this.jwtService.decode<GoogleJwtPayload>(id_token);

		const token = createUUID();

		await this.redisService.setValue(
			getVerificationTokenKey(token),
			email,
			parseStringValueToSeconds("1m"),
		);

		const searchParams = new URLSearchParams({
			action: UserAction.NON_PASSWORD_LOGIN,
			token,
		}).toString();

		return res.redirect(`${this.appConf.frontendUrl}/redirect?${searchParams}`);
	}

	async requestMagicLink({
		email,
	}: RequestMagicLinkDto): Promise<SuccessResponseDto> {
		const token = createUUID();

		const searchParams = new URLSearchParams({
			action: UserAction.NON_PASSWORD_LOGIN,
			token,
		}).toString();

		await this.redisService.setValue<string>(
			getVerificationTokenKey(token),
			email,
			parseStringValueToSeconds("5m"),
		);

		await this.mailProducer.sendMagicLinkEmail({
			to: email,
			magicLink: `${this.appConf.frontendUrl}/redirect?${searchParams}`,
		});

		return { success: true };
	}

	async verifyToken(token: string) {
		const email = await this.redisService.getValue<string>(
			getVerificationTokenKey(token),
		);

		if (!email) throw new UnauthorizedException("Invalid or expired code.");

		let user = await this.userRepository.findOne({ email });
		if (!user) {
			user = this.userRepository.create({
				username: generateFromEmail(email, 3),
				email,
				emailVerified: true,
			});
		}

		const tokenPair = await this._createTokenPair({
			userId: user.id,
			sessionId: createUUID(),
			role: user.role,
		});

		await this.redisService.deleteKey(token);
		await this.em.flush();

		return tokenPair;
	}

	async getMyInfo(userId: UUID): Promise<UserResponseDto> {
		const user = await this.userRepository.findOne(userId);

		if (!user) throw new UnauthorizedException("User not found.");

		return wrap(user).toObject();
	}

	async signUp({ username, password, verifiedToken }: SignUpDto) {
		const email = await this.redisService.getValue<string>(
			getSignUpSessionKey(verifiedToken),
		);
		if (!email) throw new BadRequestException();

		let user = await this.userRepository.findOne({ email });
		if (user?.emailVerified) {
			await this.redisService.deleteKey(getSignUpSessionKey(verifiedToken));
			throw new BadRequestException();
		}

		user = this.userRepository.create({
			username,
			email,
			password: await argon2.hash(password),
			emailVerified: true,
		});

		const tokenPair = await this._createTokenPair({
			userId: user.id,
			sessionId: createUUID(),
			role: user.role,
		});

		await this.redisService.deleteKey(getSignUpSessionKey(verifiedToken));
		await this.em.flush();

		return tokenPair;
	}

	async login({ email, password }: LoginDto) {
		const user = await this.userRepository.findOne({ email });

		const isValidPassword =
			user?.password && (await argon2.verify(user.password, password));
		if (!isValidPassword) throw new BadRequestException("Invalid credentials");

		return await this._createTokenPair({
			userId: user.id,
			sessionId: createUUID(),
			role: user.role,
		});
	}

	async logout({
		userId,
		sessionId,
	}: UserJwtPayload): Promise<SuccessResponseDto> {
		const userTokenKey = getUserSessionKey(userId, sessionId);
		await this.redisService.deleteKey(userTokenKey);

		return { success: true };
	}

	async refresh(refreshToken: string) {
		const payload = await this.verifyJwt(refreshToken);

		if (payload.jwtType !== JwtToken.RefreshToken) {
			throw new UnauthorizedException();
		}

		return await this._createTokenPair(
			pick(payload, ["userId", "sessionId", "role"]),
		);
	}

	async changePassword(
		userId: UUID,
		{ oldPassword, newPassword }: ChangePasswordDto,
	): Promise<SuccessResponseDto> {
		const user = await this.userRepository.findOne(userId);
		if (!user?.password) throw new BadRequestException();

		const isOldPasswordValid = await argon2.verify(user.password, oldPassword);
		if (!isOldPasswordValid)
			throw new BadRequestException("Invalid credentials");

		const isSamePassword = await argon2.verify(user.password, newPassword);
		if (isSamePassword)
			throw new BadRequestException(
				"New password must be different from current password",
			);

		this.userRepository.assign(user, { password: newPassword });

		await this.em.flush();

		return { success: true };
	}

	async requestEmailVerification({
		email,
	}: RequestEmailVerificationDto): Promise<SuccessResponseDto> {
		const user = await this.userRepository.findOne({ email });
		if (user?.emailVerified) {
			return { success: true };
		}

		const attempts = await this.redisService.increaseAttempts(
			getEmailVerificationKey(email, "request_attempts"),
			RATE_LIMIT.REQUEST_EMAIL_VERIFICATION.WINDOW_SECONDS,
		);

		if (attempts > RATE_LIMIT.REQUEST_EMAIL_VERIFICATION.MAX_ATTEMPTS) {
			throw new BadRequestException(
				"Too many attempts, please try again later",
			);
		}

		const otp = this._createOtp();
		const data: OtpData = {
			hashedOtp: await argon2.hash(otp),
		};

		await this.redisService.setValue(
			getEmailVerificationKey(email, "otp"),
			data,
			parseStringValueToSeconds("5m"),
		);

		await this.mailProducer.sendOtpEmail({ to: email, otp });

		return { success: true };
	}

	async confirmEmailVerification({
		email,
		otp,
	}: ConfirmEmailVerificationDto): Promise<ConfirmEmailVerificationResponseDto> {
		const attempts = await this.redisService.increaseAttempts(
			getEmailVerificationKey(email, "confirm_attempts"),
			RATE_LIMIT.CONFIRM_EMAIL_VERIFICATION.WINDOW_SECONDS,
		);

		if (attempts > RATE_LIMIT.CONFIRM_EMAIL_VERIFICATION.MAX_ATTEMPTS) {
			throw new BadRequestException(
				"Too many attempts, please try again later",
			);
		}

		const data = await this.redisService.getValue<OtpData>(
			getEmailVerificationKey(email, "otp"),
		);
		if (!data) throw new BadRequestException();

		const isOtpValid = await argon2.verify(data.hashedOtp, otp);
		if (!isOtpValid) throw new BadRequestException();

		await Promise.all([
			this.redisService.deleteKey(getEmailVerificationKey(email, "otp")),
			this.redisService.deleteKey(
				getEmailVerificationKey(email, "confirm_attempts"),
			),
		]);

		const user = await this.userRepository.findOne({ email });
		if (user?.emailVerified) {
			throw new BadRequestException("Email already verified");
		}

		const verifiedToken = createUUID();
		await this.redisService.setValue(
			getSignUpSessionKey(verifiedToken),
			email,
			parseStringValueToSeconds("5m"),
		);

		return { verifiedToken };
	}

	async requestPasswordReset({
		email,
	}: RequestPasswordResetDto): Promise<SuccessResponseDto> {
		const user = await this.userRepository.findOne({ email });
		if (!user) {
			return { success: true };
		}

		const attempts = await this.redisService.increaseAttempts(
			getPasswordResetKey(email, "request_attempts"),
			RATE_LIMIT.REQUEST_PASSWORD_RESET.WINDOW_SECONDS,
		);

		if (attempts > RATE_LIMIT.REQUEST_PASSWORD_RESET.MAX_ATTEMPTS) {
			throw new BadRequestException(
				"Too many attempts, please try again later",
			);
		}

		const otp = this._createOtp();
		const data: OtpData = {
			hashedOtp: await argon2.hash(otp),
		};

		await this.redisService.setValue(
			getPasswordResetKey(email, "otp"),
			data,
			parseStringValueToSeconds("5m"),
		);

		await this.mailProducer.sendOtpEmail({ to: email, otp });

		return { success: true };
	}

	async confirmPasswordReset({
		email,
		otp,
	}: ConfirmPasswordResetDto): Promise<ConfirmPasswordResetResponseDto> {
		const attempts = await this.redisService.increaseAttempts(
			getPasswordResetKey(email, "confirm_attempts"),
			RATE_LIMIT.CONFIRM_PASSWORD_RESET.WINDOW_SECONDS,
		);

		if (attempts > RATE_LIMIT.CONFIRM_PASSWORD_RESET.MAX_ATTEMPTS) {
			throw new BadRequestException(
				"Too many attempts, please try again later",
			);
		}

		const data = await this.redisService.getValue<OtpData>(
			getPasswordResetKey(email, "otp"),
		);
		if (!data) throw new BadRequestException();

		const isOtpValid = await argon2.verify(data.hashedOtp, otp.toString());
		if (!isOtpValid) throw new BadRequestException();

		await Promise.all([
			this.redisService.deleteKey(getPasswordResetKey(email, "otp")),
			this.redisService.deleteKey(
				getPasswordResetKey(email, "confirm_attempts"),
			),
		]);

		const resetToken = createUUID();
		await this.redisService.setValue(
			getResetPasswordSessionKey(resetToken),
			email,
			parseStringValueToSeconds("5m"),
		);

		return { resetToken };
	}

	async resetPassword({
		resetToken,
		newPassword,
	}: ResetPasswordDto): Promise<SuccessResponseDto> {
		const email = await this.redisService.getValue<string>(
			getResetPasswordSessionKey(resetToken),
		);
		if (!email) throw new BadRequestException();

		const user = await this.userRepository.findOne({ email });
		if (!user) throw new BadRequestException();

		const isSamePassword =
			user.password && (await argon2.verify(user.password, newPassword));
		if (isSamePassword) {
			throw new BadRequestException(
				"New password must be different from current password",
			);
		}

		this.userRepository.assign(user, {
			password: await argon2.hash(newPassword),
		});

		await this.redisService.deleteKey(getResetPasswordSessionKey(resetToken));
		await this.em.flush();

		return { success: true };
	}

	async verifyJwt(jwt: string) {
		try {
			const payload = await this.jwtService.verifyAsync<UserJwtPayload>(jwt);
			const { userId, sessionId, jti } = payload;

			const currentJti = await this.redisService.getValue<string>(
				getUserSessionKey(userId, sessionId),
			);

			if (currentJti !== jti) throw new UnauthorizedException();

			return payload;
		} catch {
			throw new UnauthorizedException();
		}
	}

	private async _createTokenPair({
		userId,
		sessionId,
		role,
	}: CreateTokenPairOptions): Promise<TokenPairResponseDto> {
		const jti = createUUID();

		const jwtPayload: UserJwtPayload = {
			userId,
			sessionId,
			jwtType: JwtToken.AccessToken,
			role,
			jti,
		};

		const refreshTokenPayload: UserJwtPayload = {
			...jwtPayload,
			jwtType: JwtToken.RefreshToken,
		};

		const [accessToken, refreshToken] = await Promise.all([
			this.jwtService.signAsync(jwtPayload, {
				expiresIn: this.authConf.jwtExpiresIn,
			}),

			this.jwtService.signAsync(refreshTokenPayload, {
				expiresIn: this.authConf.refreshTokenExpiresIn,
			}),

			this.redisService.setValue(
				getUserSessionKey(userId, sessionId),
				jti,
				parseStringValueToSeconds(this.authConf.refreshTokenExpiresIn),
			),
		]);

		return { accessToken, refreshToken };
	}

	private _createOtp() {
		return randomInt(100000, 1000000).toString();
	}
}
