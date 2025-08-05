import { invalidateTags } from "@/hooks/use-cache";
import { post } from "@/db/schema";
import db from "@/lib/db";
import { eq, inArray } from "drizzle-orm";
import { object, uuid, array, type infer as Infer } from "zod/mini";

export const deletePostSchema = object({
	id: uuid(),
});

export const deleteManyPostsSchema = object({
	ids: array(uuid()),
});

export async function deletePost(params: Infer<typeof deletePostSchema>) {
	const deletedPost = await db
		.delete(post)
		.where(eq(post.id, params.id))
		.returning()
		.execute();

	await invalidateTags(
		"posts",
		"posts-all",
		"posts-filtered",
		"post-count",
		"posts:indexing",
		`post:${params.id}`,
	);

	return deletedPost[0];
}

export async function deleteManyPosts(
	params: Infer<typeof deleteManyPostsSchema>,
) {
	const deletedPosts = await db
		.delete(post)
		.where(inArray(post.id, params.ids))
		.returning()
		.execute();

	await invalidateTags(
		"posts",
		"posts-all",
		"posts-filtered",
		"post-count",
		"posts:indexing",
		...params.ids.map((id) => `post:${id}`),
	);

	return deletedPosts;
}
