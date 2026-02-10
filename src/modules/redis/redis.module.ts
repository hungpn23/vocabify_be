import { RedisConfig, redisConfig } from "@config";
import { Global, Logger, Module } from "@nestjs/common";
import { Redis } from "ioredis";
import { REDIS_CLIENT } from "./redis.constant";
import { RedisService } from "./redis.service";

@Global()
@Module({
	providers: [
		{
			provide: REDIS_CLIENT,
			useFactory: async (redisConfig: RedisConfig) => {
				const logger = new Logger(REDIS_CLIENT);
				const { connectionString, ...rest } = redisConfig;
				let redis: Redis;

				if (connectionString) {
					redis = new Redis(connectionString);
				} else {
					redis = new Redis(rest);
				}

				redis
					.ping()
					.then(() => {
						logger.log(`Redis client connected`);
					})
					.catch(() => {
						logger.error(`Redis client connection failed`);
					});

				redis.on("error", (err) => {
					logger.error(err.message);
				});

				return redis;
			},
			inject: [redisConfig.KEY],
		},
		RedisService,
	],
	exports: [RedisService],
})
export class RedisModule {}
