import { withCache } from "@/hooks/use-cache";
import {
	optional,
	object,
	number,
	string,
	trim,
	uuid,
	type infer as Infer,
} from "zod/mini";
import { eq, ilike, desc } from "drizzle-orm";
import db from "@/lib/db";
import { bookAuthor, chapter, subject } from "@/db/schema";

export type ChapterTable = {
	id: string;
	name: string;
	book: {
		name: string;
		id: string;
	};
	subject: {
		name: string;
		id: string;
	};
};

export const getChaptersSchema = optional(
	object({
		page: optional(number()),
		limit: optional(number()),
		query: optional(string().check(trim())),
	}),
);

export const getChapterByIdSchema = object({
	id: uuid(),
});

export const getChaptersByBookSchema = object({
	bookAuthorId: uuid(),
});

export const getChapters = withCache(
	async (params: Infer<typeof getChaptersSchema>) => {
		const page = params?.page || 1;
		const limit = params?.limit || 10;
		const query = params?.query?.trim();

		// Build the query with joins
		let queryBuilder = db
			.select({
				id: chapter.id,
				name: chapter.name,
				book: {
					name: bookAuthor.name,
					id: bookAuthor.id,
				},
				subject: {
					name: subject.name,
					id: subject.id,
				},
			})
			.from(chapter)
			.innerJoin(bookAuthor, eq(chapter.bookAuthorId, bookAuthor.id))
			.innerJoin(subject, eq(bookAuthor.subjectId, subject.id))
			.$dynamic();

		// Apply search filter if provided
		if (query) {
			queryBuilder = queryBuilder.where(ilike(chapter.name, `%${query}%`));
		}

		// Apply ordering and pagination
		const results = await queryBuilder
			.orderBy(desc(chapter.createdAt))
			.offset((page - 1) * limit)
			.limit(limit)
			.execute();

		return results;
	},
	{
		tags: (params) => [
			"chapters",
			...(params?.query ? [`chapter-search:${params.query}`] : []),
		],
		ttl: 300, // 5 minutes
	},
);

export const getChapterById = withCache(
	async ({ id }: Infer<typeof getChapterByIdSchema>) => {
		const [chapterData] = await db
			.select({
				id: chapter.id,
				name: chapter.name,
				bookAuthorId: chapter.bookAuthorId,
				createdAt: chapter.createdAt,
			})
			.from(chapter)
			.where(eq(chapter.id, id))
			.limit(1)
			.execute();

		return chapterData || null;
	},
	{
		prefix: "chapter",
		tags: (params) => [`chapter:${params.id}`],
		ttl: 3600, // 1 hour
	},
);

export const getChaptersByBook = withCache(
	async ({ bookAuthorId }: Infer<typeof getChaptersByBookSchema>) => {
		const chapters = await db
			.select({
				id: chapter.id,
				name: chapter.name,
			})
			.from(chapter)
			.where(eq(chapter.bookAuthorId, bookAuthorId))
			.execute();

		return chapters;
	},
	{
		prefix: "book-chapters",
		tags: (params) => [`book:${params.bookAuthorId}`, "chapters"],
		ttl: 1800, // 30 minutes
	},
);
