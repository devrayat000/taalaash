import { invalidateTags } from "@/hooks/use-cache";
import { bookmark } from "@/db/schema";
import db from "@/lib/db";
import { and, eq } from "drizzle-orm";
import { object, uuid, boolean, type infer as Infer } from "zod/mini";

export const toggleBookmarkSchema = object({
	postId: uuid(),
	userId: uuid(),
	initial: boolean(),
});

export const createBookmarkSchema = object({
	postId: uuid(),
	userId: uuid(),
});

export const deleteBookmarkSchema = object({
	postId: uuid(),
	userId: uuid(),
});

export async function toggleBookmark(
	params: Infer<typeof toggleBookmarkSchema>,
) {
	const { postId, userId, initial } = params;

	if (initial) {
		await db
			.delete(bookmark)
			.where(and(eq(bookmark.postId, postId), eq(bookmark.userId, userId)));

		await invalidateTags(`user:${userId}`, "bookmarks", "bookmark-list");
		return false;
	} else {
		await db.insert(bookmark).values({ postId, userId }).returning();

		await invalidateTags(`user:${userId}`, "bookmarks", "bookmark-list");
		return true;
	}
}

export async function createBookmark(
	params: Infer<typeof createBookmarkSchema>,
) {
	const { postId, userId } = params;

	const [data] = await db
		.insert(bookmark)
		.values({ postId, userId })
		.returning();

	await invalidateTags(`user:${userId}`, "bookmarks", "bookmark-list");
	return data;
}

export async function deleteBookmark(
	params: Infer<typeof deleteBookmarkSchema>,
) {
	const { postId, userId } = params;

	const [data] = await db
		.delete(bookmark)
		.where(and(eq(bookmark.postId, postId), eq(bookmark.userId, userId)))
		.returning();

	await invalidateTags(`user:${userId}`, "bookmarks", "bookmark-list");
	return data;
}
