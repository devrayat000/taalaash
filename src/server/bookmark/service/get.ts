import { withCache } from "@/hooks/use-cache";
import { object, uuid, string, type infer as Infer } from "zod/mini";
import { desc, eq, sql } from "drizzle-orm";
import {
	accounts,
	bookAuthor,
	bookmark,
	chapter,
	post,
	subject,
	users,
} from "@/db/schema";
import db from "@/lib/db";
import type { PostWithAllRelations } from "@/server/post/service/get";

const bookmarkedPostByProviderIdStatement = db
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
	.from(bookmark)
	.innerJoin(post, eq(bookmark.postId, post.id))
	.innerJoin(chapter, eq(chapter.id, post.chapterId))
	.innerJoin(bookAuthor, eq(bookAuthor.id, chapter.bookAuthorId))
	.innerJoin(subject, eq(subject.id, bookAuthor.subjectId))
	.innerJoin(accounts, eq(bookmark.userId, accounts.userId))
	.where(eq(accounts.accountId, sql.placeholder("userId")))
	.orderBy(desc(bookmark.createdAt))
	.prepare("get_bookmarked_posts_by_provider_statement");

// Schemas
export const getBookmarkedPostsSchema = object({
	userId: uuid(),
});

export const getBookmarkedListSchema = object({
	userId: uuid(),
});

export const getBookmarkedPostsByProviderIdSchema = object({
	accountId: string(),
});

// Service functions
export const getBookmarkedPosts = withCache(
	async ({ userId }: Infer<typeof getBookmarkedPostsSchema>) => {
		const bookmarkedIds = await db
			.select({ postId: bookmark.postId })
			.from(bookmark)
			.innerJoin(users, eq(bookmark.userId, users.id))
			.where(eq(users.id, userId))
			.orderBy(desc(bookmark.createdAt));
	},
	{
		prefix: "user-bookmarks",
		tags: (params) => [`user:${params.userId}`, "bookmarks"],
		ttl: 600, // 10 minutes
	},
);

export const getBookmarkedList = withCache(
	async ({ userId }: Infer<typeof getBookmarkedListSchema>) => {
		const bookmarked = await db
			.select({
				postId: bookmark.postId,
			})
			.from(bookmark)
			.where(eq(bookmark.userId, userId))
			.orderBy(desc(bookmark.createdAt));

		return bookmarked;
	},
	{
		prefix: "user-bookmark-list",
		tags: (params) => [`user:${params.userId}`, "bookmark-list"],
		ttl: 600, // 10 minutes
	},
);

export const getBookmarkedPostsByProviderId = withCache(
	async ({ accountId }: Infer<typeof getBookmarkedPostsByProviderIdSchema>) => {
		const bookmarked = await bookmarkedPostByProviderIdStatement.execute({
			userId: accountId,
		});
		return bookmarked;
	},
	{
		prefix: "provider-bookmarks",
		tags: (params) => [`account:${params.accountId}`, "bookmarks"],
		ttl: 600, // 10 minutes
	},
);

// Export types
export type BookmarkedPosts = PostWithAllRelations[];
export type BookmarkedList = Awaited<
	ReturnType<typeof getBookmarkedList>
>["data"];
export type BookmarkedPostsByProviderId = PostWithAllRelations[];
