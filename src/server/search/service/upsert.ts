import { z } from "zod";
import { pineconeIndex } from "@/lib/pinecone";
import { getManyPostsForIndexing } from "@/server/post/service";

export const upsertPostsSchema = z.object({
	postIds: z.array(z.string()),
});

export type UpsertPostsInput = z.infer<typeof upsertPostsSchema>;

export async function upsertPosts(params: UpsertPostsInput) {
	console.log(`Upserting posts to Pinecone...`);
	const posts = await getManyPostsForIndexing({ data: params.postIds });
	await pineconeIndex.upsertRecords(posts).catch(console.log);
}
