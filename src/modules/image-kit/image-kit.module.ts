import { IntegrationConfig, integrationConfig } from "@config";
import ImageKit from "@imagekit/nodejs";
import { Module } from "@nestjs/common";
import { IMAGEKIT_CLIENT } from "./image-kit.const";
import { ImageKitService } from "./image-kit.service";

@Module({
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
