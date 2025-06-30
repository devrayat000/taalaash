import { createServerFn } from "@tanstack/react-start";
import { optional, string } from "valibot";
import { bookAuthor } from "@/db/schema";
import db from "@/lib/db";
import { count, ilike, sql } from "drizzle-orm";

const bookCountStatement = db
	.select({ count: count() })
	.from(bookAuthor)
	.where(ilike(bookAuthor.name, sql.placeholder("query")))
	.prepare("get_books_count");

export const countBooks = createServerFn({ method: "GET" })
	.validator(optional(string()))
	.handler(async ({ data: query }) => {
		query = `%${query ?? ""}%`;
		console.log({ query });

		const [{ count }] = await bookCountStatement.execute({ query });

		return count;
	});
