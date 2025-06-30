import { createServerFn } from "@tanstack/react-start";
import { array, string } from "valibot";
import { eq, inArray } from "drizzle-orm";
import db from "@/lib/db";
import { bookAuthor, chapter, post, subject } from "@/db/schema";
import { type PostForIndexing } from "./get-all-posts";

export const getManyPostsForIndexing = createServerFn({ method: "GET" })
  .validator(array(string()))
  .handler(async ({ data: ids }): Promise<PostForIndexing[]> => {
    if (ids.length === 0) {
      return [];
    }

    return db
      .select({
        objectID: post.id,
        text: post.text,
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
      .where(inArray(post.id, ids))
      .execute();
  });
