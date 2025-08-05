import { withCache } from "@/hooks/use-cache";
import {
	optional,
	object,
	number,
	string,
	array,
	uuid,
	trim,
	type infer as Infer,
} from "zod/mini";
import { and, eq, ilike, inArray, desc, type SQL } from "drizzle-orm";
import db from "@/lib/db";
import { post, bookAuthor, subject, chapter } from "@/db/schema";
import { countPosts } from "./count";

// Schemas
export const getPostsSchema = optional(
	object({
		// Filtering
		ids: optional(array(uuid())),
		chapters: optional(array(uuid())),
		books: optional(array(uuid())),
		subjects: optional(array(uuid())),
		query: optional(string().check(trim())),

		// Pagination
		page: optional(number()),
		limit: optional(number()),
	}),
);

export const getPostByIdSchema = object({
	id: uuid(),
});

// Service Functions

/**
 * Universal posts retrieval function with filtering and pagination
 */
export const getPosts = withCache(
	async (params: Infer<typeof getPostsSchema>) => {
		const {
			page = 1,
			limit,
			query,
			ids,
			chapters,
			books,
			subjects,
		} = params || {};

		let queryBuilder = db
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
				},
				book: {
					id: bookAuthor.id,
					name: bookAuthor.name,
				},
				subject: {
					id: subject.id,
					name: subject.name,
				},
			})
			.from(post)
			.innerJoin(chapter, eq(post.chapterId, chapter.id))
			.innerJoin(bookAuthor, eq(chapter.bookAuthorId, bookAuthor.id))
			.innerJoin(subject, eq(bookAuthor.subjectId, subject.id))
			.$dynamic();

		// Build conditions array
		const conditions: SQL<unknown>[] = [];

		if (ids?.length) conditions.push(inArray(post.id, ids));
		if (chapters?.length) conditions.push(inArray(post.chapterId, chapters));
		if (books?.length) conditions.push(inArray(bookAuthor.id, books));
		if (subjects?.length) conditions.push(inArray(subject.id, subjects));
		if (query?.trim())
			conditions.push(ilike(chapter.name, `%${query.trim()}%`));

		// Apply filters and ordering
		if (conditions.length > 0)
			queryBuilder = queryBuilder.where(and(...conditions));
		queryBuilder = queryBuilder.orderBy(desc(post.createdAt));

		// Apply pagination
		if (limit) {
			if (page > 1) queryBuilder = queryBuilder.offset((page - 1) * limit);
			queryBuilder = queryBuilder.limit(limit);
		}

		// Execute query with optional count
		if (page && limit) {
			const [data, { data: count }] = await Promise.all([
				queryBuilder.execute(),
				countPosts({ query: query?.trim() }),
			]);
			return { data, count };
		}

		return queryBuilder.execute();
	},
	{
		tags: ["posts"],
		ttl: 180,
	},
);

/**
 * Get a single post by ID with all relations
 */
export const getPostById = withCache(
	async ({ id }: Infer<typeof getPostByIdSchema>) => {
		const postData = await db
			.select({
				id: post.id,
				page: post.page,
				keywords: post.keywords,
				imageUrl: post.imageUrl,
				createdAt: post.createdAt,
				chapter: {
					id: chapter.id,
					name: chapter.name,
				},
				subject: {
					id: subject.id,
					name: subject.name,
				},
				book: {
					id: bookAuthor.id,
					name: bookAuthor.name,
				},
			})
			.from(post)
			.innerJoin(chapter, eq(post.chapterId, chapter.id))
			.innerJoin(bookAuthor, eq(chapter.bookAuthorId, bookAuthor.id))
			.innerJoin(subject, eq(bookAuthor.subjectId, subject.id))
			.where(eq(post.id, id))
			.limit(1)
			.execute();

		return postData[0] || null;
	},
	{
		tags: ["posts"],
		ttl: 1800,
	},
);

/**
 * Get a single post by ID formatted for indexing
 */
export const getPostByIdForIndexing = withCache(
	async ({ id }: Infer<typeof getPostByIdSchema>) => {
		const postData = await db
			.select({
				objectID: post.id,
				keywords: post.keywords,
				imageUrl: post.imageUrl,
				chapter: {
					name: chapter.name,
				},
				book: {
					name: bookAuthor.name,
				},
				subject: {
					name: subject.name,
				},
			})
			.from(post)
			.innerJoin(chapter, eq(post.chapterId, chapter.id))
			.innerJoin(bookAuthor, eq(chapter.bookAuthorId, bookAuthor.id))
			.innerJoin(subject, eq(bookAuthor.subjectId, subject.id))
			.where(eq(post.id, id))
			.limit(1)
			.execute();

		return postData[0] || null;
	},
	{
		tags: ["posts"],
		ttl: 600,
	},
);
