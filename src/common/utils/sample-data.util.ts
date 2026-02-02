import * as fs from "node:fs";
import * as path from "node:path";
import { EntryRecord } from "@common/types";

export function getSampleData() {
	const DATA_PATH = path.join(process.cwd(), "data.json");

	const jsonData = fs.readFileSync(DATA_PATH, "utf-8");
	return JSON.parse(jsonData) as EntryRecord[];
}
