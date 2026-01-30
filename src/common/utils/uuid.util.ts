import { UUID } from "@common/types/branded.type";
import { v4 } from "uuid";

export function createUUID() {
	return v4() as UUID;
}
