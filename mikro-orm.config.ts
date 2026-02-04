import "dotenv/config";
import path from "node:path";
import * as entities from "@db/entities";
import { Migrator } from "@mikro-orm/migrations";
import { defineConfig } from "@mikro-orm/postgresql";
import { SeedManager } from "@mikro-orm/seeder";

const isProduction = process.env.NODE_ENV === "production";

export default defineConfig({
	clientUrl: process.env.DB_CONNECTION_STRING,
	host: process.env.DB_HOST,
	port: Number(process.env.DB_PORT),
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	dbName: process.env.DB_DATABASE,
	schema: process.env.DB_SCHEMA,
	entities: Object.values(entities),
	extensions: [SeedManager, Migrator],
	seeder: { pathTs: path.join(process.cwd(), "src/db/seeders") },
	migrations: {
		path: path.join(process.cwd(), "dist/db/migrations"),
		pathTs: path.join(process.cwd(), "src/db/migrations"),
	},

	driverOptions: isProduction
		? {
				connection: { ssl: { rejectUnauthorized: false } },
			}
		: undefined,
});
