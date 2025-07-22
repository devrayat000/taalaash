import { PostgresJsDatabase, drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "../db/schema";
import { env } from "./utils";

const dbUrl =
	process.env.DATABASE_URL ??
	"postgres://postgres:postgres@localhost:5432/bionex";

// for query purposes
const queryClient = postgres(dbUrl);

declare global {
	var dz: PostgresJsDatabase<typeof schema> | undefined;
}

const db =
	globalThis.dz ||
	drizzle(queryClient, {
		logger: process.env.NODE_ENV !== "production",
		schema,
	});
if (process.env.NODE_ENV !== "production") globalThis.dz = db;

export default db;

export { queryClient as dbClient };
