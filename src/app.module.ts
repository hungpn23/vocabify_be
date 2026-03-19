import { AppController } from "@app.controller";
import { NodeEnv } from "@common/enums";
import { HttpCacheInterceptor } from "@common/interceptors";
import {
	appConfig,
	authConfig,
	DatabaseConfig,
	databaseConfig,
	getAppConfig,
	googleConfig,
	integrationConfig,
	mailConfig,
	RedisConfig,
	redisConfig,
	vectorDbConfig,
} from "@config";
import * as entities from "@db/entities";
import KeyvRedis from "@keyv/redis";
import { MikroOrmModule } from "@mikro-orm/nestjs";
import { PostgreSqlDriver } from "@mikro-orm/postgresql";
import { SqlHighlighter } from "@mikro-orm/sql-highlighter";
import { Modules } from "@modules/modules.module";
import { BullModule } from "@nestjs/bullmq";
import { CacheManagerOptions, CacheModule } from "@nestjs/cache-manager";
import { Logger, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_INTERCEPTOR } from "@nestjs/core";
import ms from "ms";

const isProduction = getAppConfig().nodeEnv === NodeEnv.PRODUCTION;

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			envFilePath: isProduction ? ".env" : ".env.local",
			cache: true,
			expandVariables: true, // support ${<ENV_KEY>} in .env file
			skipProcessEnv: true,
			load: [
				appConfig,
				authConfig,
				databaseConfig,
				googleConfig,
				integrationConfig,
				mailConfig,
				redisConfig,
				vectorDbConfig,
			],
		}),

		MikroOrmModule.forRootAsync({
			useFactory: (dbConfig: DatabaseConfig) => {
				const logger = new Logger("MikroORM");

				return {
					...dbConfig,

					debug: true,
					highlighter: new SqlHighlighter(),
					logger: (msg) => logger.debug(msg),

					driver: PostgreSqlDriver,
					entities: Object.values(entities),
				};
			},
			inject: [databaseConfig.KEY],
			driver: PostgreSqlDriver,
		}),

		CacheModule.registerAsync({
			isGlobal: true,
			inject: [redisConfig.KEY],
			useFactory: (redisConf: RedisConfig) => {
				const { connectionString, ...rest } = redisConf;
				const config: CacheManagerOptions = {
					ttl: ms(rest.cacheTtl),
				};

				return Object.assign(config, {
					store: new KeyvRedis(connectionString ? connectionString : rest),
				});
			},
		}),

		BullModule.forRootAsync({
			inject: [redisConfig.KEY],
			useFactory: (redisConf: RedisConfig) => ({
				connection: { url: redisConf.connectionString },
			}),
		}),

		Modules,
	],
	controllers: [AppController],
	providers: [
		{
			provide: APP_INTERCEPTOR,
			useClass: HttpCacheInterceptor,
		},
	],
})
export class AppModule {}
