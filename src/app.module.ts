import { ApiModule } from "@api/api.module";
import { AppController } from "@app.controller";
import { NodeEnv } from "@common/enums";
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
import { IntegrationModule } from "@integrations/intergration.module";
import KeyvRedis from "@keyv/redis";
import { MikroOrmModule } from "@mikro-orm/nestjs";
import { PostgreSqlDriver } from "@mikro-orm/postgresql";
import { SqlHighlighter } from "@mikro-orm/sql-highlighter";
import { BullModule } from "@nestjs/bullmq";
import { CacheManagerOptions, CacheModule } from "@nestjs/cache-manager";
import { Logger, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { RedisModule } from "./redis/redis.module";

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
					...(!isProduction && {
						debug: true,
						highlighter: new SqlHighlighter(),
						logger: (msg) => logger.debug(msg),
					}),

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
				return {
					stores: [new KeyvRedis(redisConf.connectionString)],
				} satisfies CacheManagerOptions;
			},
		}),

		BullModule.forRootAsync({
			inject: [redisConfig.KEY],
			useFactory: (redisConf: RedisConfig) => ({
				connection: { url: redisConf.connectionString },
			}),
		}),

		RedisModule,
		ApiModule,
		IntegrationModule,
	],
	controllers: [AppController],
})
export class AppModule {}
