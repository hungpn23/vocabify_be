import { ApiEndpointPublic } from "@common/decorators";
import { Controller, Get } from "@nestjs/common";

@Controller()
export class AppController {
	@ApiEndpointPublic()
	@Get("hello")
	getHello() {
		return { message: "Hello World!" };
	}
}
