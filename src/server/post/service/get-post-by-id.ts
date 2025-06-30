import { createServerFn } from "@tanstack/react-start";
import { string } from "valibot";
import { eq } from "drizzle-orm";
import db from "@/lib/db";
import { bookAuthor, post, subject, chapter } from "@/db/schema";

// Define the return type
export type PostByIdData = {
  id: string;
  text: string;
  page: number | null;
  keywords: string[] | null;
  imageUrl: string;
  createdAt: Date;
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
};

export const getPostById = createServerFn({ method: "GET" })
  .validator(string())
  .handler(async ({ data: id }): Promise<PostByIdData | null> => {
    const postData = await db
      .select({
        id: post.id,
        text: post.text,
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
      .innerJoin(subject, eq(bookAuthor.subjectId, subject.id))
      .where(eq(post.id, id))
      .limit(1)
      .execute();

    return postData[0] || null;
  });

export type PostById = PostByIdData | null;
