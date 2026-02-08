import { Seconds } from "@common/types";

export const RATE_LIMIT = {
	EMAIL_VERIFICATION: {
		MAX_ATTEMPTS: 5,
		WINDOW_SECONDS: (24 * 60 * 60) as Seconds,
	},
} as const;
