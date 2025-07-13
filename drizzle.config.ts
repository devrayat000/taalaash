import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
	schema: ["./src/db/schema.ts"],
	dialect: "postgresql",
	dbCredentials: {
		url:
			process.env.DATABASE_URL ??
			"postgres://postgres:postgres@localhost:5432/taalaash-latest",
	},
	verbose: true,
	strict: true,
	out: "./drizzle",
});
