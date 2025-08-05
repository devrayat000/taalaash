import { eq } from "drizzle-orm";
import {
	object,
	string,
	number,
	array,
	uuid,
	type infer as Infer,
} from "zod/mini";
import { invalidateTags } from "@/hooks/use-cache";

import { post } from "@/db/schema";
import db from "@/lib/db";

export const createPostSchema = object({
	id: uuid(),
	imageUrl: string(),
	chapterId: string(),
	keywords: array(string()),
	page: number(),
});

export const createPost = async (
	params: Infer<typeof createPostSchema> | Infer<typeof createPostSchema>[],
) => {
	const results = await db
		.insert(post)
		.values(Array.isArray(params) ? params : [params])
		.returning({ id: post.id });

	// Invalidate related caches
	await invalidateTags(
		"posts",
		"posts-all",
		"posts-filtered",
		"post-count",
		"posts:indexing",
	);

	return results;
};

export const updatePostSchema = object({
	id: uuid(),
	imageUrl: string(),
	chapterId: string(),
	keywords: array(string()),
	page: number(),
});

export const updatePost = async (params: Infer<typeof updatePostSchema>) => {
	const { id, ...updateData } = params;
	const [data] = await db
		.update(post)
		.set(updateData)
		.where(eq(post.id, id))
		.returning({ id: post.id });

	// Invalidate related caches
	await invalidateTags(
		"posts",
		"posts-all",
		"posts-filtered",
		"post-count",
		"posts:indexing",
		`post-${id}`,
	);

	return data;
};
