import { createServerFn } from "@tanstack/react-start";
import { string } from "valibot";
import { eq } from "drizzle-orm";
import db from "@/lib/db";
import { bookAuthor, chapter, subject } from "@/db/schema";
import { type ChapterWithBookAndSubject } from "./get-filtered-chapters";

export const getChapterById = createServerFn({ method: "GET" })
  .validator(string())
  .handler(async ({ data: id }): Promise<ChapterWithBookAndSubject | null> => {
    const chapterData = await db
      .select({
        id: chapter.id,
        name: chapter.name,
        createdAt: chapter.createdAt,
        bookAuthorId: chapter.bookAuthorId,
        book: {
          id: bookAuthor.id,
          name: bookAuthor.name,
          edition: bookAuthor.edition,
          marked: bookAuthor.marked,
        },
        subject: {
          id: subject.id,
          name: subject.name,
          createdAt: subject.createdAt,
        },
      })
      .from(chapter)
      .innerJoin(bookAuthor, eq(chapter.bookAuthorId, bookAuthor.id))
      .innerJoin(subject, eq(bookAuthor.subjectId, subject.id))
      .where(eq(chapter.id, id))
      .limit(1)
      .execute();

    return chapterData[0] || null;
  });
