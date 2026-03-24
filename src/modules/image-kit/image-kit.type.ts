import { UUID } from "@common/types";

export type FolderSegments = {
	subFolder: "avatars" | "decks" | "cards";
	resourceId?: UUID;
};
