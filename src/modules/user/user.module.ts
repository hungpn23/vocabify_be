import { User } from "@db/entities";
import { MikroOrmModule } from "@mikro-orm/nestjs";
import { ImageKitModule } from "@modules/image-kit/image-kit.module";
import { Module } from "@nestjs/common";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";

@Module({
	imports: [ImageKitModule, MikroOrmModule.forFeature([User])],
	controllers: [UserController],
	providers: [UserService],
})
export class UserModule {}
