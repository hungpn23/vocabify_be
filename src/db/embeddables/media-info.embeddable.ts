import { Embeddable, Property } from "@mikro-orm/core";

@Embeddable()
export class MediaInfo {
	@Property() url!: string;
	@Property() fileId!: string;
	@Property() filePath!: string;
}
