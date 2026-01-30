import { ApiEndpointPublic } from "@common";
import { Controller, Get } from "@nestjs/common";

@Controller()
export class AppController {
	@ApiEndpointPublic()
	@Get("hello")
	getHello() {
		// throw new BadRequestException('No!!!!!!!');
		return { message: "Hello World!" };
	}
}
