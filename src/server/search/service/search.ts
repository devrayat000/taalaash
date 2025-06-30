import { pineconeIndex } from "@/lib/pinecone";
import { authed } from "@/server/middleware";
import { getFilteredPosts } from "@/server/post/service/get-filtered-posts";
import { createServerFn } from "@tanstack/react-start";
import {
	object,
	string,
	pipe,
	nonEmpty,
	optional,
	array,
	number,
	integer,
} from "valibot";

export const searchRecords = createServerFn({ method: "GET" })
	.middleware([authed])
	.validator(
		object({
			query: pipe(string(), nonEmpty()),
			subject: optional(array(string())),
			chapter: optional(array(string())),
			book: optional(array(string())),
			limit: optional(pipe(number(), integer()), 12),
		}),
	)
	.handler(async ({ context, data, signal }) => {
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
			// rerank: {
			// 	model: "bge-reranker-v2-m3",
			// 	rankFields: ["content"],
			// 	topN: 12,
			// },
		});
		const postsByIds = await getFilteredPosts({
			data: { posts: searchWithText.result.hits.map((hit) => hit._id) },
		});

		return postsByIds;
	});
