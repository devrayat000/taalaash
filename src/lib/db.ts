import { PostgresJsDatabase, drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "../db/schema";
import { env } from "./utils";

const dbUrl =
	process.env.DATABASE_URL ??
	"postgres://postgres:postgres@localhost:5432/bionex";

// for query purposes

declare global {
	var db: PostgresJsDatabase<typeof schema> | undefined;
}

if (typeof window === "undefined") {
	const queryClient = postgres(dbUrl);
	const db =
		globalThis.db ||
		drizzle(queryClient, {
			logger: process.env.NODE_ENV !== "production",
			schema,
		});
	globalThis.db = db;
}

export default globalThis.db!;

// export { queryClient as dbClient };
