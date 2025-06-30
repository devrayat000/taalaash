import { pineconeIndex } from "@/lib/pinecone";
import { authed } from "@/server/middleware";
import { getManyPostsForIndexing } from "@/server/post/service";
import { createServerFn } from "@tanstack/react-start";
import { array, object, string } from "valibot";

export const upsertPosts = createServerFn({ method: "POST" })
	.middleware([authed])
	.validator(
		object({
			postIds: array(string()),
		}),
	)
	.handler(async ({ data: { postIds } }) => {
		const posts = await getManyPostsForIndexing({ data: postIds });
		await pineconeIndex.upsertRecords(posts);
	});
