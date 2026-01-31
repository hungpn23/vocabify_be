import { Seconds, UUID } from "@common/types";
import { Inject, Injectable } from "@nestjs/common";
import { Redis } from "ioredis";
import { REDIS_CLIENT } from "./redis.constant";

@Injectable()
export class RedisService {
	constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

	async getValue<T = unknown>(key: string) {
		const data = await this.redis.get(key);
		if (!data) return null;

		try {
			const parsed = JSON.parse(data);

			if (typeof parsed === "object") return parsed as T;

			return data as T;
		} catch {
			// in case JSON.parse throw
			return data as T;
		}
	}

	async setValue<T = unknown>(key: string, value: T, ttlInSeconds?: Seconds) {
		const serialized =
			typeof value === "string" ? value : JSON.stringify(value);

		if (ttlInSeconds) {
			await this.redis.set(key, serialized, "EX", ttlInSeconds);
		} else {
			await this.redis.set(key, serialized);
		}
	}

	async deleteKey(key: string) {
		await this.redis.del(key);
	}

	getUserSessionKey(userId: UUID, sessionId: UUID) {
		return `user:${userId}:session:${sessionId}`;
	}

	getTokenToVerifyKey(token: string) {
		return `token_to_verify:${token}`;
	}
}
