import { pineconeIndex } from "@/lib/pinecone";
import { authed } from "@/server/middleware";
import { getFilteredPosts } from "@/server/post/service/get-filtered-posts";
import { createServerFn, serverOnly } from "@tanstack/react-start";
import { notFound } from "@tanstack/react-router";
import {
	object,
	string,
	optional,
	array,
	int,
	minLength,
	_default,
	type infer as Infer,
	positive,
} from "zod/mini";

const searchSchema = object({
	query: string().check(
		minLength(1, "Query must be at least 1 character long"),
	),
	subject: optional(array(string())),
	chapter: optional(array(string())),
	book: optional(array(string())),
	limit: _default(optional(int().check(positive())), 12),
});

const search = serverOnly(async (data: Infer<typeof searchSchema>) => {
	const searchWithText = await pineconeIndex.searchRecords({
		query: {
			topK: data.limit,
			inputs: { text: data.query },
			filter: {
				subject: data.subject ? { $in: data.subject } : undefined,
				chapter: data.chapter ? { $in: data.chapter } : undefined,
				book: data.book ? { $in: data.book } : undefined,
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
				message: "No posts found for the given query.",
			},
		});
	}

	const postsByIds = await getFilteredPosts({
		data: { posts: searchWithText.result.hits.map((hit) => hit._id) },
	});

	if (!postsByIds.length) {
		throw notFound({
			data: {
				message: "No posts found for the given query.",
			},
		});
	}

	return postsByIds;
});

export const searchRecords = createServerFn({ method: "GET" })
	.middleware([authed])
	.validator(searchSchema)
	.handler(async ({ context, data, signal }) => {
		console.log("Search data:", data);

		const [searchResults] = await Promise.all([
			search(data),
			new Promise((resolve) => setTimeout(resolve, 5000)), // Simulate delay
		]);

		return searchResults;
	});
