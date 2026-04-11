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
import { MulterModule } from "@nestjs/platform-express";
import ms from "ms";
import { memoryStorage } from "multer";

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
				return {
					stores: [new KeyvRedis(redisConf.connectionString)],
					ttl: ms("1d"),
				} satisfies CacheManagerOptions;
			},
		}),

		BullModule.forRootAsync({
			inject: [redisConfig.KEY],
			useFactory: (redisConf: RedisConfig) => ({
				connection: { url: redisConf.connectionString },
			}),
		}),

		MulterModule.register({
			storage: memoryStorage(),
			limits: { fileSize: 5 * 1024 * 1024 },
		}),
		Modules,
	],
	controllers: [AppController],
	// providers: [
	// 	{
	// 		provide: APP_INTERCEPTOR,
	// 		useClass: HttpCacheInterceptor,
	// 	},
	// ],
})
export class AppModule {}
