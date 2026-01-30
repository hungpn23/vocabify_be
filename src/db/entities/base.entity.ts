import { UUID } from "@common/types";
import { NullableProperty } from "@common/utils";
import { Opt, PrimaryKey, Property, t } from "@mikro-orm/core";
import { v4 } from "uuid";

export abstract class BaseEntity {
	@PrimaryKey({ type: t.uuid })
	id: Opt<UUID> = v4() as UUID;

	@Property({ type: t.datetime })
	createdAt: Opt<Date> = new Date();

	@NullableProperty({ type: t.datetime, onUpdate: () => new Date() })
	updatedAt?: Date | null;
}

export abstract class SoftDeleteBaseEntity extends BaseEntity {
	@NullableProperty()
	deletedAt?: Date | null;
}
