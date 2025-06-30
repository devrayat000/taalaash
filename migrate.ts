import dotenv from "dotenv";
import path from "node:path";

const dtResult = dotenv.config({
  path: [
    path.resolve(process.cwd(), ".env.local"),
    // path.resolve(process.cwd(), ".env"),
  ],
});

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { migrate } from "drizzle-orm/postgres-js/migrator";

// for query purposes

if (dtResult.parsed) {
  const queryClient = postgres(process.env.DATABASE_URL!, { max: 1 });
  const db = drizzle(queryClient, { logger: true });

  await migrate(db, {
    migrationsFolder: "drizzle",
  });

  await queryClient.end();
}

process.exit(0);
