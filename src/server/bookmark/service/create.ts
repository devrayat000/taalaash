import { invalidateTags } from "@/hooks/use-cache";
import { bookmark } from "@/db/schema";
import db from "@/lib/db";
import { and, eq } from "drizzle-orm";
import {
	object,
	uuid,
	boolean,
	string,
	omit,
	type infer as Infer,
} from "zod/mini";

const toggleBookmarkSchemaRaw = object({
	postId: uuid(),
	userId: string(),
	initial: boolean(),
});
export const toggleBookmarkSchema = omit(toggleBookmarkSchemaRaw, {
	userId: true,
});

const createBookmarkSchemaRaw = object({
	postId: uuid(),
	userId: string(),
});

export const createBookmarkSchema = omit(createBookmarkSchemaRaw, {
	userId: true,
});

const deleteBookmarkSchemaRaw = object({
	postId: uuid(),
	userId: string(),
});

export const deleteBookmarkSchema = omit(deleteBookmarkSchemaRaw, {
	userId: true,
});

export async function toggleBookmark(
	params: Infer<typeof toggleBookmarkSchemaRaw>,
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
	params: Infer<typeof createBookmarkSchemaRaw>,
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
	params: Infer<typeof deleteBookmarkSchemaRaw>,
) {
	const { postId, userId } = params;

	const [data] = await db
		.delete(bookmark)
		.where(and(eq(bookmark.postId, postId), eq(bookmark.userId, userId)))
		.returning();

	await invalidateTags(`user:${userId}`, "bookmarks", "bookmark-list");
	return data;
}
