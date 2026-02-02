import { ApiEndpointPublic } from "@common/decorators";
import { SuccessResponseDto } from "@common/dtos";
import { Controller, Get } from "@nestjs/common";
import { plainToInstance } from "class-transformer";

@Controller()
export class AppController {
	@ApiEndpointPublic({ type: SuccessResponseDto })
	@Get("health-check")
	checkHealth() {
		return plainToInstance(SuccessResponseDto, {
			success: true,
		});
	}
}
