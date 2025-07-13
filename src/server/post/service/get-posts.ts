import { createServerFn } from "@tanstack/react-start";
import { optional, object, number, string } from "valibot";
import { eq, ilike, desc } from "drizzle-orm";
import db from "@/lib/db";
import { bookAuthor, chapter, post, subject } from "@/db/schema";
import { GetParams, GetResults } from "../../types";
import { countPosts } from "./count-posts";
import { authed } from "@/server/middleware";

export type PostTable = {
	id: string;
	text: string;
	page: number | null;
	keywords: string[] | null;
	imageUrl: string;
	chapter: {
		name: string;
		id: string;
	};
	subject: {
		name: string;
		id: string;
	};
	book: {
		name: string;
		id: string;
	};
	createdAt: Date;
};

const getPostsSchema = optional(
	object({
		page: optional(number()),
		limit: optional(number()),
		query: optional(string()),
	}),
);

export const getPosts = createServerFn({ method: "GET" })
	.middleware([authed])
	.validator(getPostsSchema)
	.handler(async ({ data: params }) => {
		const page = params?.page || 1;
		const limit = params?.limit || 10;
		const query = params?.query?.trim();
		console.log("getPosts -> query", query);

		// Build the query with joins
		let queryBuilder = db
			.select({
				id: post.id,
				page: post.page,
				keywords: post.keywords,
				imageUrl: post.imageUrl,
				createdAt: post.createdAt,
				chapter: {
					name: chapter.name,
					id: chapter.id,
				},
				subject: {
					name: subject.name,
					id: subject.id,
				},
				book: {
					name: bookAuthor.name,
					id: bookAuthor.id,
				},
			})
			.from(post)
			.innerJoin(chapter, eq(post.chapterId, chapter.id))
			.innerJoin(bookAuthor, eq(chapter.bookAuthorId, bookAuthor.id))
			.innerJoin(subject, eq(bookAuthor.subjectId, subject.id));

		// Apply search filter if provided
		// if (query) {
		// 	// @ts-ignore
		// 	queryBuilder = queryBuilder.where(ilike(post.text, `%${query}%`));
		// }

		// Apply ordering and pagination
		// @ts-ignore
		queryBuilder = queryBuilder
			.orderBy(desc(post.createdAt))
			.offset((page - 1) * limit)
			.limit(limit);

		const [data, count] = await Promise.all([
			queryBuilder.execute(),
			countPosts({ data: query }),
		]);

		return { data, count };
	});
