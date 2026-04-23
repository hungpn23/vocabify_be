import "./arktype.config";
import { AppModule } from "@app.module";
import { NodeEnv } from "@common/enums";
import { GlobalExceptionFilter } from "@common/filters";
import { AuthGuard, RoleBasedAccessControlGuard } from "@common/guards";
import { getAppConfig } from "@config";
import { MikroORM } from "@mikro-orm/core";
import { AuthService } from "@modules/auth/auth.service";
import { Logger } from "@nestjs/common";
import { NestFactory, Reflector } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { SocketIOAdapter } from "@socket-io.adapter";
import compression from "compression";
import helmet from "helmet";
import { ArkValidationPipe } from "nestjs-arktype";

async function bootstrap() {
	const logger = new Logger("Bootstrap");
	const { apiPrefix, host, port, nodeEnv, frontendUrl } = getAppConfig();

	const app = await NestFactory.create(AppModule);
	const authService = app.get(AuthService);
	const reflector = app.get(Reflector);

	app.enableCors({
		origin: frontendUrl,
		methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
		allowedHeaders: ["Content-Type", "Authorization"],
		credentials: true,
	});

	app.setGlobalPrefix(apiPrefix);

	app.use(compression());
	app.use(helmet());
	app.useWebSocketAdapter(new SocketIOAdapter(app, authService));
	app.useGlobalGuards(new AuthGuard(reflector, authService));
	app.useGlobalGuards(new RoleBasedAccessControlGuard(reflector));
	app.useGlobalPipes(new ArkValidationPipe());
	app.useGlobalFilters(new GlobalExceptionFilter());

	const isProduction = nodeEnv === NodeEnv.PRODUCTION;
	if (!isProduction) {
		const orm = app.get(MikroORM);
		await orm.schema.updateSchema();
	}

	const config = new DocumentBuilder()
		.setTitle("NestJS Boilerplate API")
		.setDescription(
			"Reusable NestJS boilerplate with auth, user, mail, and notification modules.",
		)
		.setVersion("1.0")
		.addBearerAuth()
		.build();
	const documentFactory = () => SwaggerModule.createDocument(app, config);
	SwaggerModule.setup("swagger", app, documentFactory, {
		jsonDocumentUrl: `swagger-json`,
	});

	const appUrl = `http://${host}:${port}/${apiPrefix}`;

	await app.listen(port, host, () => {
		logger.debug(`Current environment: ${nodeEnv}`);

		if (!isProduction) {
			logger.debug(`API endpoint: ${appUrl}`);
			logger.debug(`Health check: ${appUrl}/health-check`);
			logger.debug(`Swagger docs: http://${host}:${port}/swagger`);
		}
	});
}

void bootstrap();
