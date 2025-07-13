import { createServerFn } from "@tanstack/react-start";
import { string } from "valibot";
import { eq } from "drizzle-orm";
import db from "@/lib/db";
import { bookAuthor, post, subject, chapter } from "@/db/schema";
import { type PostForIndexing } from "./get-all-posts";

export const getPostByIdForIndexing = createServerFn({ method: "GET" })
	.validator(string())
	.handler(async ({ data: id }): Promise<PostForIndexing | null> => {
		const postData = await db
			.select({
				objectID: post.id,
				keywords: post.keywords,
				imageUrl: post.imageUrl,
				chapter: {
					name: chapter.name,
				},
				book: {
					name: bookAuthor.name,
					edition: bookAuthor.edition,
				},
				subject: {
					name: subject.name,
				},
			})
			.from(post)
			.innerJoin(chapter, eq(post.chapterId, chapter.id))
			.innerJoin(bookAuthor, eq(chapter.bookAuthorId, bookAuthor.id))
			.innerJoin(subject, eq(bookAuthor.subjectId, subject.id))
			.where(eq(post.id, id))
			.limit(1)
			.execute();

		return postData[0] || null;
	});

export type PostHit = PostForIndexing | null;
