import { createServerFn } from "@tanstack/react-start";
import { string } from "valibot";
import { eq } from "drizzle-orm";
import db from "@/lib/db";
import { bookAuthor, subject } from "@/db/schema";

// Define the return type
export type BookWithSubject = {
  id: string;
  name: string;
  edition: string;
  marked: boolean;
  createdAt: Date;
  subjectId: string;
  coverUrl: string | null;
  subject: {
    id: string;
    name: string;
    createdAt: Date;
  };
};

export const getBookById = createServerFn({ method: "GET" })
  .validator(string())
  .handler(async ({ data: id }): Promise<BookWithSubject | null> => {
    const book = await db
      .select({
        id: bookAuthor.id,
        name: bookAuthor.name,
        edition: bookAuthor.edition,
        marked: bookAuthor.marked,
        createdAt: bookAuthor.createdAt,
        subjectId: bookAuthor.subjectId,
        coverUrl: bookAuthor.coverUrl,
        subject: {
          id: subject.id,
          name: subject.name,
          createdAt: subject.createdAt,
        },
      })
      .from(bookAuthor)
      .innerJoin(subject, eq(bookAuthor.subjectId, subject.id))
      .where(eq(bookAuthor.id, id))
      .limit(1)
      .execute();

    return book[0] || null;
  });
