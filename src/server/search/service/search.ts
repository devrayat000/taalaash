import { denseIndex, sparseIndex, pinecone } from "@/lib/pinecone";
import { authed } from "@/server/middleware";
import { getPosts } from "@/server/post/service/get";
import { createServerFn, serverOnly } from "@tanstack/react-start";
import { notFound } from "@tanstack/react-router";
import type { infer as Infer } from "zod/mini";
import { searchSchema } from "@/app/_root/_routes/_search/search/~components/searchSchema";
import type { Hit } from "@pinecone-database/pinecone/dist/pinecone-generated-ts-fetch/db_data";

const denseSearch = serverOnly(async (data: Infer<typeof searchSchema>) => {
	const searchWithText = await denseIndex.searchRecords({
		query: {
			topK: data.limit * 5,
			inputs: { text: data.query },
			filter: {
				subject: !!data.subjects?.length ? { $in: data.subjects } : undefined,
				chapter: !!data.chapters?.length ? { $in: data.chapters } : undefined,
				book: !!data.books?.length ? { $in: data.books } : undefined,
			},
		},
		fields: ["id", "text", "subject", "chapter"],
	});

	return searchWithText;
});

const sparseSearch = serverOnly(async (data: Infer<typeof searchSchema>) => {
	const searchWithText = await sparseIndex.searchRecords({
		query: {
			topK: data.limit * 5,
			inputs: { text: data.query },
			filter: {
				subject: !!data.subjects?.length ? { $in: data.subjects } : undefined,
				chapter: !!data.chapters?.length ? { $in: data.chapters } : undefined,
				book: !!data.books?.length ? { $in: data.books } : undefined,
			},
		},
		fields: ["id", "text", "subject", "chapter"],
	});

	return searchWithText;
});

function mergeChunks(h1: Hit[], h2: Hit[]) {
	// Get the unique hits from two search results and return them as single array of {'_id', 'chunk_text'} dicts

	// Combine all hits from both arrays
	const allHits = [...h1, ...h2];

	// Deduplicate by _id using Map
	const dedupedHitsMap = new Map<string, Hit>();
	allHits.forEach((hit) => {
		dedupedHitsMap.set(hit._id, hit);
	});

	// Sort by _score descending
	const sortedHits = Array.from(dedupedHitsMap.values()).sort(
		(a, b) => b._score - a._score,
	);

	// Transform to format for reranking
	const result = sortedHits.map((hit) => ({
		_id: hit._id,
		...hit.fields,
	}));

	return result;
}

const rerank = serverOnly(
	async (query: string, documents: any[], { limit }: { limit: number }) => {
		return pinecone.inference.rerank("cohere-rerank-3.5", query, documents, {
			topN: limit,
			rankFields: ["text", "subject", "chapter"],
			returnDocuments: true,
		});
	},
);

const search = serverOnly(async (data: Infer<typeof searchSchema>) => {
	const [denseResult, sparseResult] = await Promise.all([
		denseSearch(data),
		sparseSearch(data),
	]);

	const mergedHits = mergeChunks(
		denseResult.result.hits,
		sparseResult.result.hits,
	);

	if (!mergedHits.length) {
		throw notFound({
			data: {
				message: "No posts found in the vector database.",
			},
			routeId: "/_root/_routes/_search/search/",
		});
	}

	const rerankedResults = await rerank(data.query, mergedHits, {
		limit: data.limit,
	});

	const { data: postsResult } = await getPosts({
		ids: rerankedResults.data.map((result) => result.document!._id),
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
