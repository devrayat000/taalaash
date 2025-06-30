import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import db from "@/lib/db";
import { bookAuthor, post, subject, chapter } from "@/db/schema";

// Define the return type for indexing
export type PostForIndexing = {
  objectID: string;
  text: string;
  keywords: string[] | null;
  imageUrl: string;
  chapter: {
    name: string;
  };
  book: {
    name: string;
    edition: string;
  };
  subject: {
    name: string;
  };
};

export const getAllPostsForIndexing = createServerFn({ method: "GET" }).handler(
  async (): Promise<PostForIndexing[]> => {
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
      .execute();
  }
);
