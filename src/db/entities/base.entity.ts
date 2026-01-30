import { UUID } from "@common/types";
import { createUUID, NullableProperty } from "@common/utils";
import { Opt, PrimaryKey, Property, t } from "@mikro-orm/core";

export abstract class BaseEntity {
	@PrimaryKey({ type: t.uuid })
	id: Opt<UUID> = createUUID();

	@Property({ type: t.datetime })
	createdAt: Opt<Date> = new Date();

	@NullableProperty({ type: t.datetime, onUpdate: () => new Date() })
	updatedAt?: Date | null;
}

export abstract class SoftDeleteBaseEntity extends BaseEntity {
	@NullableProperty()
	deletedAt?: Date | null;
}
