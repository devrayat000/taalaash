import { pineconeIndex } from "@/lib/pinecone";
import { authed } from "@/server/middleware";
import { getPosts } from "@/server/post/service/get";
import { createServerFn, serverOnly } from "@tanstack/react-start";
import { notFound } from "@tanstack/react-router";
import type { infer as Infer } from "zod/mini";
import { searchSchema } from "@/app/_root/_routes/_search/search/~components/searchSchema";

const search = serverOnly(async (data: Infer<typeof searchSchema>) => {
	const searchWithText = await pineconeIndex.searchRecords({
		query: {
			topK: data.limit * 3,
			inputs: { text: data.query },
			filter: {
				subject: !!data.subjects?.length ? { $in: data.subjects } : undefined,
				chapter: !!data.chapters?.length ? { $in: data.chapters } : undefined,
				book: !!data.books?.length ? { $in: data.books } : undefined,
			},
		},
		fields: ["id"],
		rerank: {
			model: "cohere-rerank-3.5",
			rankFields: ["text"],
			topN: data.limit,
		},
	});
	console.log("Search results:", searchWithText.result.hits);
	if (!searchWithText.result.hits.length) {
		throw notFound({
			data: {
				message: "No posts found in the vector database.",
			},
			routeId: "/_root/_routes/_search/search/",
		});
	}

	const { data: postsResult } = await getPosts({
		ids: searchWithText.result.hits.map((hit) => hit._id),
	});

	// Handle the fact that getPosts can return either an array or paginated result
	const postsByIds = Array.isArray(postsResult)
		? postsResult
		: postsResult.data;

	console.log("Filtered posts count:", postsByIds.length);

	if (!postsByIds.length) {
		throw notFound({
			data: {
				message: "No posts found in the database.",
			},
			routeId: "/_root/_routes/_search/search/",
		});
	}

	return postsByIds;
});

export const searchRecords = createServerFn({ method: "GET" })
	.middleware([authed])
	.validator(searchSchema)
	.handler(async ({ data }) => {
		console.log("Search data:", data);

		const [searchResults] = await Promise.all([
			search(data),
			new Promise((resolve) => setTimeout(resolve, 5000)), // Simulate delay
		]);

		return searchResults;
	});
