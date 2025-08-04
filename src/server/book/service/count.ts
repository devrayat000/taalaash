import { withCache } from "@/hooks/use-cache";
import { optional, object, string, trim, type infer as Infer } from "zod/mini";
import { bookAuthor } from "@/db/schema";
import db from "@/lib/db";
import { count, ilike, sql } from "drizzle-orm";

export const countBooksSchema = optional(
	object({
		query: optional(string().check(trim())),
	}),
);

const bookCountStatement = db
	.select({ count: count() })
	.from(bookAuthor)
	.where(ilike(bookAuthor.name, sql.placeholder("query")))
	.prepare("get_books_count");

export const countBooks = withCache(
	async (params: Infer<typeof countBooksSchema>) => {
		const query = `%${params?.query ?? ""}%`;
		console.log({ query });

		const [{ count }] = await bookCountStatement.execute({ query });

		return count;
	},
	{
		tags: (params) => [
			"books",
			"book-count",
			...(params?.query ? [`book-search:${params.query}`] : []),
		],
		ttl: 300, // 5 minutes
	},
);
