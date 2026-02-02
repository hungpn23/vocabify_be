import "dotenv/config";
import { AuthService } from "@api/auth/auth.service";
import { AppModule } from "@app.module";
import { NodeEnv } from "@common/enums";
import { GlobalExceptionFilter } from "@common/filters";
import { AuthGuard, RoleBasedAccessControlGuard } from "@common/guards";
import { FieldsValidationPipe } from "@common/pipes";
import { getAppConfig, VectorDbConfig, vectorDbConfig } from "@config";
import { MikroORM } from "@mikro-orm/core";
import { ClassSerializerInterceptor, Logger } from "@nestjs/common";
import { NestFactory, Reflector } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { SocketIOAdapter } from "@socket-io.adapter";

async function bootstrap() {
	const logger = new Logger("Bootstrap");
	const { apiPrefix, host, port, nodeEnv, frontendUrl } = getAppConfig();

	const app = await NestFactory.create(AppModule);
	const authService = app.get(AuthService);
	const reflector = app.get(Reflector);
	const { host: vectorDbHost, port: vectorDbPort } = app.get<VectorDbConfig>(
		vectorDbConfig.KEY,
	);

	app.enableCors({
		origin: frontendUrl,
		methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
		allowedHeaders: ["Content-Type", "Authorization"],
		credentials: true,
	});

	app.setGlobalPrefix(apiPrefix);

	// apply nestjs middlewares and components
	app.useWebSocketAdapter(new SocketIOAdapter(app, authService));
	app.useGlobalInterceptors(
		new ClassSerializerInterceptor(reflector, {
			strategy: "excludeAll",
			enableCircularCheck: true,
			excludeExtraneousValues: true,
		}),
	);
	app.useGlobalGuards(new AuthGuard(reflector, authService));
	app.useGlobalGuards(new RoleBasedAccessControlGuard(reflector));
	app.useGlobalPipes(new FieldsValidationPipe());
	app.useGlobalFilters(new GlobalExceptionFilter());

	const isLocalEnv = nodeEnv === NodeEnv.LOCAL;
	if (isLocalEnv) {
		const orm = app.get(MikroORM);
		await orm.schema.updateSchema();
	}

	const config = new DocumentBuilder()
		.setTitle("App title")
		.setDescription("App API description")
		.setVersion("1.0")
		.addBearerAuth()
		.build();
	const documentFactory = () => SwaggerModule.createDocument(app, config);
	SwaggerModule.setup("docs", app, documentFactory, { useGlobalPrefix: true });

	const appUrl = `http://${host}:${port}/${apiPrefix}`;

	await app.listen(port, host, () => {
		if (isLocalEnv) {
			logger.debug(`Current environment: ${nodeEnv}`);
			logger.debug(`API endpoint: ${appUrl}`);
			logger.debug(`Health check: ${appUrl}/health-check`);
			logger.debug(`Swagger docs: ${appUrl}/docs`);
			logger.debug(
				`Qdrant dashboard: http://${vectorDbHost}:${vectorDbPort}/dashboard`,
			);
		}
	});
}

void bootstrap();
