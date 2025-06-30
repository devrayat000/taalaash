// import without from "lodash/without";

// import { postIndex } from "@/lib/algolia";
import { createServerFn } from "@tanstack/react-start";
import { authed } from "@/server/middleware";
import { array, object, string } from "valibot";
import db from "@/lib/db";
import { bookAuthor, chapter, post, subject } from "@/db/schema";
import { and, count, eq, ilike, inArray } from "drizzle-orm";

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
				count: count(),
			})
			.from(bookAuthor)
			.innerJoin(subject, eq(bookAuthor.subjectId, subject.id))
			.innerJoin(chapter, eq(bookAuthor.id, chapter.bookAuthorId))
			.innerJoin(post, eq(chapter.id, post.chapterId))
			.where(
				and(inArray(subject.name, subjects), ilike(post.text, `%${query}%`)),
			)
			.groupBy(bookAuthor.id, bookAuthor.name);

		return books;
	});

export const getChaptersByBook = createServerFn({ method: "GET" })
	// .middleware([authed])
	.validator(
		object({
			subjects: array(string()),
			books: array(string()),
			query: string(),
		}),
	)
	.handler(async ({ data: { books, subjects, query } }) => {
		const chapters = await db
			.select({
				id: bookAuthor.id,
				value: bookAuthor.name,
				count: count(),
			})
			.from(bookAuthor)
			.innerJoin(subject, eq(bookAuthor.subjectId, subject.id))
			.innerJoin(chapter, eq(bookAuthor.id, chapter.bookAuthorId))
			.innerJoin(post, eq(chapter.id, post.chapterId))
			.where(
				and(
					inArray(subject.name, subjects),
					inArray(bookAuthor.name, books),
					ilike(post.text, `%${query}%`),
				),
			)
			.groupBy(chapter.id, chapter.name);

		return chapters;
	});
