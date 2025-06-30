import { createServerFn } from "@tanstack/react-start";
import { array, string } from "valibot";
import { eq, inArray } from "drizzle-orm";
import db from "@/lib/db";
import { bookAuthor, chapter, post, subject } from "@/db/schema";
import { type PostForIndexing } from "./get-all-posts";

export const getManyPostsForIndexing = createServerFn({ method: "GET" })
	.validator(array(string()))
	.handler(async ({ data: ids }) => {
		if (ids.length === 0) {
			return [];
		}

		return db
			.select({
				id: post.id,
				text: post.text,
				chapter: chapter.name,
				book: bookAuthor.name,
				edition: bookAuthor.edition,
				subject: subject.name,
			})
			.from(post)
			.innerJoin(chapter, eq(post.chapterId, chapter.id))
			.innerJoin(bookAuthor, eq(chapter.bookAuthorId, bookAuthor.id))
			.innerJoin(subject, eq(bookAuthor.subjectId, subject.id))
			.where(inArray(post.id, ids))
			.execute();
	});
