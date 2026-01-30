import { Seconds } from "@common/types";
import ms from "ms";

export function parseStringValueToSeconds(value: ms.StringValue) {
	return Math.floor(ms(value) / 1000) as Seconds;
}
