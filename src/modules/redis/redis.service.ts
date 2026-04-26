import { Seconds } from "@common/types";
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

	async setValue<TValue = unknown>(
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

	async deleteKey(key: string) {
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

	async hset(
		key: string,
		field: string,
		value: unknown,
		ttlInSeconds?: Seconds,
	) {
		const serialized =
			typeof value === "string" ? value : JSON.stringify(value);
		await this.redis.hset(key, field, serialized);
		if (ttlInSeconds) {
			await this.redis.expire(key, ttlInSeconds);
		}
	}

	async hget<T = unknown>(key: string, field: string): Promise<T | null> {
		const data = await this.redis.hget(key, field);
		if (!data) return null;
		try {
			return JSON.parse(data) as T;
		} catch {
			return data as T;
		}
	}

	async hgetall<T = Record<string, unknown>>(key: string): Promise<T | null> {
		const data = await this.redis.hgetall(key);
		if (!data || Object.keys(data).length === 0) return null;

		const parsed = {} as Record<string, unknown>;
		for (const [field, value] of Object.entries(data)) {
			try {
				parsed[field] = JSON.parse(value);
			} catch {
				parsed[field] = value;
			}
		}
		return parsed as T;
	}

	async hdel(key: string, field: string) {
		await this.redis.hdel(key, field);
	}

	async deleteKeys(keys: string[]) {
		if (keys.length > 0) {
			await this.redis.del(...keys);
		}
	}
}
