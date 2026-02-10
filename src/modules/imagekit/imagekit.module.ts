import { IntegrationConfig, integrationConfig } from "@config";
import ImageKit from "@imagekit/nodejs";
import { Module } from "@nestjs/common";
import { IMAGEKIT_CLIENT } from "./imagekit.provider-token";

@Module({
	providers: [
		{
			provide: IMAGEKIT_CLIENT,
			inject: [integrationConfig.KEY],
			useFactory: (integrationConfig: IntegrationConfig) =>
				new ImageKit({
					privateKey: integrationConfig.imagekitPrivateKey,
				}),
		},
	],
	exports: [IMAGEKIT_CLIENT],
})
export class ImageKitModule {}
