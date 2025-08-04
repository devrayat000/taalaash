import { withCache } from "@/hooks/use-cache";
import { optional, object, string, trim, type infer as Infer } from "zod/mini";
import { chapter } from "@/db/schema";
import db from "@/lib/db";
import { count, ilike, sql } from "drizzle-orm";

export const countChaptersSchema = optional(
	object({
		query: optional(string().check(trim())),
	}),
);

const chapterCountStatement = db
	.select({ count: count() })
	.from(chapter)
	.where(ilike(chapter.name, sql.placeholder("query")))
	.prepare("get_chapter_count");

export const countChapters = withCache(
	async (params: Infer<typeof countChaptersSchema>) => {
		const query = `%${params?.query ?? ""}%`;

		const [{ count }] = await chapterCountStatement.execute({ query });

		return count;
	},
	{
		tags: (params) => [
			"chapters",
			"chapter-count",
			...(params?.query ? [`chapter-search:${params.query}`] : []),
		],
		ttl: 300, // 5 minutes
	},
);
