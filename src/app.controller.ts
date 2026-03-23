import { ApiEndpointPublic } from "@common/decorators";
import { SuccessResponseDto } from "@common/dtos";
import { Controller, Get } from "@nestjs/common";

@Controller()
export class AppController {
	@ApiEndpointPublic({ responseType: SuccessResponseDto })
	@Get("health-check")
	checkHealth(): SuccessResponseDto {
		return { success: true };
	}
}
