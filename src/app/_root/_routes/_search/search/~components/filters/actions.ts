// import without from "lodash/without";

// import { postIndex } from "@/lib/algolia";
import { createServerFn } from "@tanstack/react-start";
import { authed } from "@/server/middleware";
import { array, object, string } from "valibot";
import db from "@/lib/db";
import { bookAuthor, chapter, post, subject } from "@/db/schema";
import { and, count, eq, exists, ilike, inArray } from "drizzle-orm";

export const getBooksBySubject = createServerFn({ method: "GET" })
	// .middleware([authed])
	.validator(
		object({
			subjects: array(string()),
			query: string(),
		}),
	)
	.handler(async ({ data: { query, subjects } }) => {
		// const facets = without([subject ? `subject.name:${subject}` : null], null);

		const books = await db
			.select({
				id: bookAuthor.id,
				value: bookAuthor.name,
			})
			.from(bookAuthor)
			// .innerJoin(subject, eq(bookAuthor.subjectId, subject.id))
			.where(
				exists(
					db
						.select()
						.from(subject)
						.where(
							and(
								eq(subject.id, bookAuthor.subjectId),
								inArray(subject.name, subjects),
							),
						),
				),
			);

		return books;
	});

export const getChaptersByBook = createServerFn({ method: "GET" })
	// .middleware([authed])
	.validator(
		object({
			books: array(string()),
			query: string(),
		}),
	)
	.handler(async ({ data: { books, query } }) => {
		const chapters = await db
			.select({
				id: chapter.id,
				value: chapter.name,
				count: count(),
			})
			.from(chapter)
			.innerJoin(bookAuthor, eq(bookAuthor.id, chapter.bookAuthorId))
			.where(
				exists(
					db
						.select()
						.from(bookAuthor)
						.where(
							and(
								eq(bookAuthor.id, chapter.bookAuthorId),
								inArray(bookAuthor.name, books),
							),
						),
				),
			);

		return chapters;
	});
