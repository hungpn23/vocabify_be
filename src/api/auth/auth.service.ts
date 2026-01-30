import crypto from "node:crypto";
import { UserDto } from "@api/user/user.dto";
import { RefreshTokenPayload, UserJwtPayload } from "@common/types/auth.type";
import { Milliseconds, type UUID } from "@common/types/branded.type";
import {
	GoogleJwtPayload,
	GoogleTokenResponse,
} from "@common/types/google.type";
import {
	type AppConfig,
	type AuthConfig,
	appConfig,
	authConfig,
	type GoogleConfig,
	googleConfig,
} from "@config";
import { Session } from "@db/entities/session.entity";
import { User } from "@db/entities/user.entity";
import { MailProducer } from "@integrations/mail/mail.producer";
import { EntityManager, EntityRepository, wrap } from "@mikro-orm/core";
import { InjectRepository } from "@mikro-orm/nestjs";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import {
	BadRequestException,
	Inject,
	Injectable,
	Logger,
	UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import argon2 from "argon2";
import type { Cache } from "cache-manager";
import { plainToInstance } from "class-transformer";
import { Response } from "express";
import ms from "ms";
import { generateFromEmail } from "unique-username-generator";
import {
	ChangePasswordDto,
	LoginDto,
	RegisterDto,
	TokenPairDto,
} from "./auth.dto";

@Injectable()
export class AuthService {
	private logger = new Logger(AuthService.name);

	constructor(
		private readonly jwtService: JwtService,
		private readonly em: EntityManager,
		private readonly mailProducer: MailProducer,
		@Inject(authConfig.KEY)
		private readonly authConf: AuthConfig,
		@Inject(appConfig.KEY)
		private readonly appConf: AppConfig,
		@Inject(googleConfig.KEY)
		private readonly googleConf: GoogleConfig,
		@Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
		@InjectRepository(Session)
		private readonly sessionRepository: EntityRepository<Session>,
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
				password: "",
			});
		}

		const tokenPair = await this._createTokenPair(user);
		const oneTimeCode = crypto.randomBytes(20).toString("hex");

		await this.cacheManager.set(
			`one_time_code:${oneTimeCode}`,
			tokenPair,
			(60 * 1000) as Milliseconds,
		);

		await this.em.flush();

		return res.redirect(`${frontendUrl}/login/callback?code=${oneTimeCode}`);
	}

	async exchangeOneTimeCodeForTokens(code: string) {
		const cacheKey = `one_time_code:${code}`;
		const tokenPair = await this.cacheManager.get<TokenPairDto>(cacheKey);

		if (!tokenPair) throw new UnauthorizedException("Invalid or expired code.");

		await this.cacheManager.del(cacheKey);

		return plainToInstance(TokenPairDto, tokenPair);
	}

	async getSession(userId: UUID) {
		const user = await this.userRepository.findOneOrFail(userId);

		return plainToInstance(UserDto, wrap(user).toPOJO());
	}

	async register(dto: RegisterDto) {
		const { username, password } = dto;
		const user = await this.userRepository.findOne({ username });

		if (user) throw new BadRequestException("Username already exists");

		const newUser = this.userRepository.create({ username, password });
		const tokenPair = await this._createTokenPair(newUser);

		await this.em.flush();

		if (newUser.email) {
			await this.mailProducer.sendWelcomeEmail({
				username: newUser.username,
				email: newUser.email,
			});
		}

		return plainToInstance(TokenPairDto, tokenPair);
	}

	async login(dto: LoginDto) {
		const { username, password } = dto;
		const user = await this.userRepository.findOne({ username });

		const isValid = user && (await argon2.verify(user.password, password));
		if (!isValid) throw new BadRequestException("Invalid credentials");

		const tokenPair = await this._createTokenPair(user);

		await this.em.flush();

		return plainToInstance(TokenPairDto, tokenPair);
	}

	async logout(user: UserJwtPayload) {
		const { sessionId, exp, userId } = user;
		await this.cacheManager.set<boolean>(
			`session_blacklist:${userId}:${sessionId}`,
			true,
			(exp! * 1000 - Date.now()) as Milliseconds,
		);

		const sessionRef = this.sessionRepository.getReference(sessionId);
		if (!sessionRef) throw new BadRequestException();

		await this.em.remove(sessionRef).flush();
	}

	async refresh(refreshToken: string) {
		const { sessionId, signature, userId } =
			await this._verifyRefreshToken(refreshToken);

		const session = await this.sessionRepository.findOne(sessionId, {
			populate: ["user"],
		});

		if (!session) throw new UnauthorizedException();

		if (session.signature !== signature) {
			this.logger.debug(
				`Refresh token reuse detected for user ${userId}, revoking all sessions`,
			);

			await this.sessionRepository.nativeDelete({ user: userId });
			throw new UnauthorizedException();
		}

		const newSignature = this._createSignature();

		const jwtPayload: UserJwtPayload = {
			userId: session.user.id,
			sessionId,
			role: session.user.$.role,
		};

		const refreshTokenPayload = {
			...jwtPayload,
			signature: newSignature,
		};

		this.sessionRepository.assign(session, {
			signature: newSignature,
		});

		const [accessToken, newRefreshToken] = await Promise.all([
			this.jwtService.signAsync(jwtPayload, {
				secret: this.authConf.jwtSecret,
				expiresIn: this.authConf.jwtExpiresIn,
			}),

			this.jwtService.signAsync(refreshTokenPayload, {
				secret: this.authConf.refreshTokenSecret,
				expiresIn: this.authConf.refreshTokenExpiresIn,
			}),

			this.em.flush(),
		]);

		return plainToInstance(TokenPairDto, {
			accessToken,
			refreshToken: newRefreshToken,
		});
	}

	async changePassword(userId: UUID, dto: ChangePasswordDto) {
		const { oldPassword, newPassword } = dto;

		const user = await this.userRepository.findOne(userId);
		if (!user) throw new BadRequestException();

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

	async verifyAccessToken(authorizationHeader?: string) {
		const accessToken = this._extractTokenFromHeader(authorizationHeader);

		let payload: UserJwtPayload;
		try {
			payload = await this.jwtService.verifyAsync(accessToken, {
				secret: this.authConf.jwtSecret,
			});
		} catch (_) {
			throw new UnauthorizedException("Invalid token");
		}

		const { userId, sessionId } = payload;
		const isInBlacklist = await this.cacheManager.get<boolean>(
			`session_blacklist:${userId}:${sessionId}`,
		);

		if (isInBlacklist) {
			const sessions = await this.sessionRepository.find({
				user: { id: userId },
			});
			await this.em.remove(sessions).flush();
			throw new UnauthorizedException();
		}

		return payload;
	}

	private _extractTokenFromHeader(authorizationHeader?: string) {
		const [type, token] = authorizationHeader?.split(" ") ?? [];
		return type === "Bearer" ? token : "";
	}

	private async _verifyRefreshToken(refreshToken: string) {
		let payload: RefreshTokenPayload;
		try {
			payload = await this.jwtService.verifyAsync(refreshToken, {
				secret: this.authConf.refreshTokenSecret,
			});
		} catch (_) {
			const payload = this.jwtService.decode<RefreshTokenPayload | null>(
				refreshToken,
			);

			if (payload?.sessionId) {
				const expiredSession = await this.sessionRepository.findOne(
					payload.sessionId,
				);

				if (expiredSession) await this.em.remove(expiredSession).flush();
			}

			throw new UnauthorizedException("Session expired");
		}

		return payload;
	}

	private async _createTokenPair(user: User) {
		const refreshTokenExpiresIn = this.authConf.refreshTokenExpiresIn;

		const signature = this._createSignature();

		const newSession = this.sessionRepository.create({
			signature,
			user: user.id,
			expiresAt: new Date(Date.now() + ms(refreshTokenExpiresIn)),
		});

		const jwtPayload: UserJwtPayload = {
			userId: user.id,
			sessionId: newSession.id,
			role: user.role,
		};

		const refreshTokenPayload: RefreshTokenPayload = {
			...jwtPayload,
			signature,
		};

		const [accessToken, refreshToken] = await Promise.all([
			this.jwtService.signAsync(jwtPayload, {
				secret: this.authConf.jwtSecret,
				expiresIn: this.authConf.jwtExpiresIn,
			}),

			this.jwtService.signAsync(refreshTokenPayload, {
				secret: this.authConf.refreshTokenSecret,
				expiresIn: refreshTokenExpiresIn,
			}),
		]);

		return { accessToken, refreshToken };
	}

	private _createSignature() {
		return crypto.randomBytes(16).toString("hex");
	}
}
