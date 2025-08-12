import { z } from "zod/mini";
import { pineconeIndex } from "@/lib/pinecone";
import { getPostByIdForIndexing } from "@/server/post/service/get";

export const upsertPostsSchema = z.object({
	postIds: z.array(z.string()),
});

export type UpsertPostsInput = z.infer<typeof upsertPostsSchema>;

export async function upsertPosts(params: UpsertPostsInput) {
	console.log(`Upserting posts to Pinecone...`);

	// Get all posts for indexing
	const postsData = await Promise.all(
		params.postIds.map(async (id) => {
			const { data } = await getPostByIdForIndexing({ id });
			return data;
		}),
	);

	// Filter out null results and format for Pinecone
	const posts = postsData
		.filter((post) => post !== null)
		.map((post) => ({
			objectID: post.objectID,
			keywords: post.keywords || [],
			imageUrl: post.imageUrl,
			chapterName: post.chapter.name,
			bookName: post.book.name,
			subjectName: post.subject.name,
		}));

	await pineconeIndex.upsertRecords(posts).catch(console.log);
}
