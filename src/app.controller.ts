import { ApiEndpointPublic } from "@common/decorators";
import { SuccessResponseDto } from "@common/dtos";
import { Controller, Get } from "@nestjs/common";

@Controller()
export class AppController {
	@ApiEndpointPublic({ type: SuccessResponseDto })
	@Get("health-check")
	checkHealth() {
		return { success: true } satisfies SuccessResponseDto;
	}
}
