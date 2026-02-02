import { UserDto } from "@api/user/user.dto";
import { SuccessResponseDto } from "@common/dtos";
import { JwtToken, UserAction, UserRole } from "@common/enums";
import {
	GoogleJwtPayload,
	GoogleTokenResponse,
	UserJwtPayload,
	type UUID,
} from "@common/types";
import { createUUID, parseStringValueToSeconds } from "@common/utils";

import {
	type AppConfig,
	type AuthConfig,
	appConfig,
	authConfig,
	type GoogleConfig,
	googleConfig,
} from "@config";
import { User } from "@db/entities";
import { MailProducer } from "@integrations/mail/mail.producer";
import { EntityManager, EntityRepository, wrap } from "@mikro-orm/core";
import { InjectRepository } from "@mikro-orm/nestjs";
import {
	BadRequestException,
	Inject,
	Injectable,
	UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { RedisService } from "@redis/redis.service";
import argon2 from "argon2";
import { plainToInstance } from "class-transformer";
import { Response } from "express";
import { pick } from "lodash";
import { generateFromEmail } from "unique-username-generator";
import {
	ChangePasswordDto,
	LoginDto,
	RegisterDto,
	RequestMagicLinkDto,
	TokenPairDto,
} from "./auth.dto";

type CreateTokenPairOptions = {
	userId: UUID;
	sessionId: UUID;
	role: UserRole;
};

@Injectable()
export class AuthService {
	// private readonly logger = new Logger(AuthService.name);

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
		// @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
		@InjectRepository(User)
		private readonly userRepository: EntityRepository<User>,
	) {}

	async googleCallback(code: string, res: Response) {
		const frontendUrl = this.appConf.frontendUrl;

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

		const data = (await response.json()) as GoogleTokenResponse;
		const { email, email_verified } = this.jwtService.decode<GoogleJwtPayload>(
			data.id_token,
		);

		let user = await this.userRepository.findOne({ email });
		if (!user) {
			user = this.userRepository.create({
				username: generateFromEmail(email, 3),
				email,
				emailVerified: email_verified,
			});
		}

		const tokenPair = await this._createTokenPair({
			userId: user.id,
			sessionId: createUUID(),
			role: user.role,
		});

		const token = createUUID();

		await Promise.all([
			this.em.flush(),
			this.redisService.setValue(
				this.redisService.getTokenToVerifyKey(token),
				tokenPair,
				parseStringValueToSeconds("1m"),
			),
		]);

		const searchParams = new URLSearchParams({
			action: UserAction.NON_PASSWORD_LOGIN,
			token,
		}).toString();

		return res.redirect(`${frontendUrl}/callback?${searchParams}`);
	}

	async verifyToken(token: string) {
		const tokenPair = await this.redisService.getValue<TokenPairDto>(
			this.redisService.getTokenToVerifyKey(token),
		);

		if (!tokenPair) throw new UnauthorizedException("Invalid or expired code.");

		await this.redisService.deleteKey(token);

		return tokenPair satisfies TokenPairDto;
	}

	async getMyInfo(userId: UUID) {
		const user = await this.userRepository.findOne(userId);

		if (!user) throw new UnauthorizedException("User not found.");

		return plainToInstance(UserDto, wrap(user).toPOJO());
	}

	async register({ email, password }: RegisterDto) {
		const username = generateFromEmail(email, 3);
		const user = await this.userRepository.findOne({ username, email });

		if (user) throw new BadRequestException("Username or email already exists");

		const newUser = this.userRepository.create({ username, email, password });
		const tokenPair = await this._createTokenPair({
			userId: newUser.id,
			sessionId: createUUID(),
			role: newUser.role,
		});

		await Promise.all([
			this.em.flush(),
			this.mailProducer.sendWelcomeEmail({
				username: newUser.username,
				to: newUser.email,
			}),
		]);

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

	async logout({ userId, sessionId }: UserJwtPayload) {
		const userTokenKey = this.redisService.getUserSessionKey(userId, sessionId);
		await this.redisService.deleteKey(userTokenKey);

		return { success: true } satisfies SuccessResponseDto;
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
	) {
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
	}

	async requestMagicLink({ email }: RequestMagicLinkDto) {
		let user = await this.userRepository.findOne({ email });

		if (!user) {
			user = this.userRepository.create({
				username: generateFromEmail(email, 3),
				email,
			});
		}

		const tokenPair = await this._createTokenPair({
			userId: user.id,
			sessionId: createUUID(),
			role: user.role,
		});

		const token = createUUID();

		const searchParams = new URLSearchParams({
			action: UserAction.NON_PASSWORD_LOGIN,
			token,
		}).toString();

		await Promise.all([
			this.em.flush(),
			this.redisService.setValue(
				this.redisService.getTokenToVerifyKey(token),
				tokenPair,
				parseStringValueToSeconds("5m"),
			),
			this.mailProducer.sendMagicLinkEmail({
				to: user.email,
				magicLink: `${this.appConf.frontendUrl}/callback?${searchParams}`,
			}),
		]);

		return { success: true } satisfies SuccessResponseDto;
	}

	async verifyJwt(jwt: string) {
		const payload = await this.jwtService.verifyAsync<UserJwtPayload>(jwt);
		const { userId, sessionId, jti } = payload;

		const userSessionKey = this.redisService.getUserSessionKey(
			userId,
			sessionId,
		);

		const currentJti = await this.redisService.getValue<string>(userSessionKey);

		if (currentJti !== jti) {
			throw new UnauthorizedException();
		}

		return payload;
	}

	private async _createTokenPair({
		userId,
		sessionId,
		role,
	}: CreateTokenPairOptions) {
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

		const userSessionKey = this.redisService.getUserSessionKey(
			userId,
			sessionId,
		);

		const [accessToken, refreshToken] = await Promise.all([
			this.jwtService.signAsync(jwtPayload, {
				expiresIn: this.authConf.jwtExpiresIn,
			}),

			this.jwtService.signAsync(refreshTokenPayload, {
				expiresIn: this.authConf.refreshTokenExpiresIn,
			}),

			this.redisService.setValue(
				userSessionKey,
				jti,
				parseStringValueToSeconds(this.authConf.refreshTokenExpiresIn),
			),
		]);

		return plainToInstance(TokenPairDto, { accessToken, refreshToken });
	}
}
