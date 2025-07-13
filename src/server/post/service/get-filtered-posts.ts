import { createServerFn } from "@tanstack/react-start";
import { object, optional, string, array, number } from "valibot";
import { and, eq, ilike, inArray, type SQL } from "drizzle-orm";
import db from "@/lib/db";
import { GetParams } from "@/server/types";
import { post, bookAuthor, subject, chapter } from "@/db/schema";

interface GetFilteredPostsParams extends GetParams {
	posts?: string[];
	chapters?: string[];
	books?: string[];
	subjects?: string[];
}

const getFilteredPostsSchema = object({
	posts: optional(array(string())),
	chapters: optional(array(string())),
	books: optional(array(string())),
	subjects: optional(array(string())),
	page: optional(number()),
	limit: optional(number()),
	query: optional(string()),
	orderBy: optional(array(string())),
});

export const getFilteredPosts = createServerFn({ method: "GET" })
	.validator(getFilteredPostsSchema)
	.handler(async ({ data: params }) => {
		// Select all fields and join with chapter, book, and subject
		const baseQuery = db
			.select({
				id: post.id,
				page: post.page,
				keywords: post.keywords,
				imageUrl: post.imageUrl,
				createdAt: post.createdAt,
				chapterId: post.chapterId,
				chapter: {
					id: chapter.id,
					name: chapter.name,
					createdAt: chapter.createdAt,
					bookAuthorId: chapter.bookAuthorId,
				},
				book: {
					id: bookAuthor.id,
					name: bookAuthor.name,
					edition: bookAuthor.edition,
					marked: bookAuthor.marked,
				},
				subject: {
					id: subject.id,
					name: subject.name,
					createdAt: subject.createdAt,
				},
			})
			.from(post)
			.innerJoin(chapter, eq(post.chapterId, chapter.id))
			.innerJoin(bookAuthor, eq(chapter.bookAuthorId, bookAuthor.id))
			.innerJoin(subject, eq(bookAuthor.subjectId, subject.id))
			.$dynamic();

		// Conditions
		let conditions: (SQL<unknown> | undefined)[] = [];

		if (!!params?.posts?.length) {
			if (params.posts.length > 1) {
				conditions.push(inArray(post.id, params.posts));
			} else {
				conditions.push(eq(post.id, params.posts[0]));
			}
		}

		if (!!params?.chapters?.length) {
			if (params.chapters.length > 1) {
				conditions.push(inArray(post.chapterId, params.chapters));
			} else {
				conditions.push(eq(post.chapterId, params.chapters[0]));
			}
		}

		if (!!params?.books?.length) {
			if (params.books.length > 1) {
				conditions.push(inArray(chapter.bookAuthorId, params.books));
			} else {
				conditions.push(eq(chapter.bookAuthorId, params.books[0]));
			}
		}

		if (!!params?.subjects?.length) {
			if (params.subjects.length > 1) {
				conditions.push(inArray(bookAuthor.subjectId, params.subjects));
			} else {
				conditions.push(eq(bookAuthor.subjectId, params.subjects[0]));
			}
		}

		// if (!!params?.query) {
		// 	conditions.push(ilike(post.text, `%${params?.query}%`));
		// }

		let queryBuilder = baseQuery;

		// Apply conditions
		if (!!conditions.length) {
			if (conditions.length > 1) {
				queryBuilder = queryBuilder.where(and(...conditions));
			} else {
				queryBuilder = queryBuilder.where(conditions[0]);
			}
		}

		// Pagination and ordering
		if (params?.orderBy?.length) {
			const orderColumns = params.orderBy.map((col) => {
				// if (col === "text") return post.text;
				if (col === "createdAt") return post.createdAt;
				if (col === "page") return post.page;
				return post.createdAt; // default
			});
			queryBuilder = queryBuilder.orderBy(...orderColumns);
		}

		if (params?.page && params.limit) {
			queryBuilder = queryBuilder.offset((params.page - 1) * params.limit);
		}
		if (params?.limit) {
			queryBuilder = queryBuilder.limit(params.limit);
		}

		return queryBuilder.execute();
	});

// Export the return type for other files to use
export type PostWithAllRelations = {
	id: string;
	text: string;
	page: number | null;
	keywords: string[] | null;
	imageUrl: string;
	createdAt: Date;
	chapterId: string;
	chapter: {
		id: string;
		name: string;
		createdAt: Date;
		bookAuthorId: string;
	};
	book: {
		id: string;
		name: string;
		edition: string;
		marked: boolean;
	};
	subject: {
		id: string;
		name: string;
		createdAt: Date;
	};
};
