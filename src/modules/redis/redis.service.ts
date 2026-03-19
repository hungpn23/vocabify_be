import { Seconds } from "@common/types";
import { Inject, Injectable } from "@nestjs/common";
import { Redis } from "ioredis";
import { REDIS_CLIENT } from "./redis.constant";

@Injectable()
export class RedisService {
	constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

	async get<T = unknown>(key: string) {
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

	async set<TValue = unknown>(
		key: string,
		value: TValue,
		ttlInSeconds?: Seconds,
	) {
		const serialized =
			typeof value === "string" ? value : JSON.stringify(value);

		if (ttlInSeconds) {
			await this.redis.set(key, serialized, "EX", ttlInSeconds);
		} else {
			await this.redis.set(key, serialized);
		}
	}

	async del(key: string) {
		await this.redis.del(key);
	}

	async increaseAttempts(key: string, ttlInSeconds: Seconds): Promise<number> {
		const count = await this.redis.incr(key);

		// set ttl if first attempt
		if (count === 1) {
			await this.redis.expire(key, ttlInSeconds);
		}

		return count;
	}
}
