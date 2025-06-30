import { createServerFn } from "@tanstack/react-start";
import { object, optional, string, array, number } from "valibot";
import { and, eq, ilike, inArray, type SQL } from "drizzle-orm";
import db from "@/lib/db";
import { GetParams } from "@/server/types";
import { chapter, bookAuthor, subject } from "@/db/schema";

interface GetFilteredChaptersParams extends GetParams {
  chapters?: string[];
  books?: string[];
  subjects?: string[];
}

const getFilteredChaptersSchema = object({
  chapters: optional(array(string())),
  books: optional(array(string())),
  subjects: optional(array(string())),
  page: optional(number()),
  limit: optional(number()),
  query: optional(string()),
  orderBy: optional(array(string())),
});

export const getFilteredChapters = createServerFn({ method: "POST" })
  .validator(getFilteredChaptersSchema)
  .handler(async ({ data: params }) => {
    // Select all fields and join with book and subject
    const baseQuery = db
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
      .innerJoin(subject, eq(bookAuthor.subjectId, subject.id));

    // Conditions
    let conditions: (SQL<unknown> | undefined)[] = [];

    if (!!params?.chapters?.length) {
      if (params.chapters.length > 1) {
        conditions.push(inArray(chapter.id, params.chapters));
      } else {
        conditions.push(eq(chapter.id, params.chapters[0]));
      }
    }

    if (!!params?.books?.length) {
      if (params.books.length > 1) {
        conditions.push(inArray(chapter.bookAuthorId, params.books));
      } else {
        conditions.push(eq(chapter.bookAuthorId, params.books[0]));
      }
    }

    if (!!params?.subjects?.length) {
      if (params.subjects.length > 1) {
        conditions.push(inArray(bookAuthor.subjectId, params.subjects));
      } else {
        conditions.push(eq(bookAuthor.subjectId, params.subjects[0]));
      }
    }

    if (params?.query) {
      conditions.push(ilike(chapter.name, `%${params?.query}%`));
    }

    let queryBuilder = baseQuery as any;

    // Apply conditions
    if (!!conditions.length) {
      if (conditions.length > 1) {
        queryBuilder = queryBuilder.where(and(...conditions));
      } else {
        queryBuilder = queryBuilder.where(conditions[0]);
      }
    }

    // Pagination and ordering
    if (params?.orderBy?.length) {
      const orderColumns = params.orderBy.map((col) => {
        if (col === "name") return chapter.name;
        if (col === "createdAt") return chapter.createdAt;
        return chapter.createdAt; // default
      });
      queryBuilder = queryBuilder.orderBy(...orderColumns);
    }

    if (params?.page && params.limit) {
      queryBuilder = queryBuilder.offset((params.page - 1) * params.limit);
    }
    if (params?.limit) {
      queryBuilder = queryBuilder.limit(params.limit);
    }

    return queryBuilder.execute();
  });

// Export the return type for other files to use
export type ChapterWithBookAndSubject = {
  id: string;
  name: string;
  createdAt: Date;
  bookAuthorId: string;
  book: {
    id: string;
    name: string;
    edition: string;
    marked: boolean;
  };
  subject: {
    id: string;
    name: string;
    createdAt: Date;
  };
};
