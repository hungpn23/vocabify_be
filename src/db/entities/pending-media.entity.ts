import { UUID } from "@common/types";
import { createUUID } from "@common/utils";
import { MediaInfo } from "@db/embeddables/media-info.embeddable";
import {
	Embedded,
	Entity,
	Index,
	ManyToOne,
	Opt,
	PrimaryKey,
	Property,
	type Ref,
	t,
} from "@mikro-orm/core";
import { User } from "./user.entity";

@Index({ properties: ["createdAt"] })
@Entity()
export class PendingMedia {
	@PrimaryKey({ type: t.uuid })
	id: Opt<UUID> = createUUID();

	@Embedded(() => MediaInfo, { prefix: "pending_" })
	media!: MediaInfo;

	@ManyToOne(() => User, { ref: true })
	owner!: Ref<User>;

	@Property({ type: t.datetime })
	createdAt: Opt<Date> = new Date();
}
