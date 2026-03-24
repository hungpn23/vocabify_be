import { IntegrationConfig, integrationConfig } from "@config";
import { User } from "@db/entities";
import ImageKit from "@imagekit/nodejs";
import { MikroOrmModule } from "@mikro-orm/nestjs";
import { Module } from "@nestjs/common";
import { IMAGEKIT_CLIENT } from "./image-kit.const";
import { ImageKitService } from "./image-kit.service";

@Module({
	imports: [MikroOrmModule.forFeature([User])],
	providers: [
		{
			provide: IMAGEKIT_CLIENT,
			inject: [integrationConfig.KEY],
			useFactory: (integrationConfig: IntegrationConfig) => {
				return new ImageKit({
					privateKey: integrationConfig.imagekitPrivateKey,
				});
			},
		},
		ImageKitService,
	],
	exports: [ImageKitService],
})
export class ImageKitModule {}
