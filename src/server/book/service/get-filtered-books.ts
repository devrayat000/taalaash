import { createServerFn } from "@tanstack/react-start";
import { object, optional, string, boolean, array, number } from "valibot";
import { and, eq, ilike, inArray, type SQL } from "drizzle-orm";
import db from "@/lib/db";
import { bookAuthor, subject } from "@/db/schema";

const getFilteredBooksSchema = object({
  books: optional(array(string())),
  marked: optional(boolean()),
  editions: optional(array(string())),
  subjects: optional(array(string())),
  page: optional(number()),
  limit: optional(number()),
  query: optional(string()),
  orderBy: optional(array(string())),
});

export const getFilteredBooks = createServerFn({ method: "POST" })
  .validator(getFilteredBooksSchema)
  .handler(async ({ data: params }) => {
    // Select all fields and join with subject
    const baseQuery = db
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
      .innerJoin(subject, eq(bookAuthor.subjectId, subject.id));

    // Conditions
    let conditions: (SQL<unknown> | undefined)[] = [];

    if (!!params?.books?.length) {
      if (params.books.length > 1) {
        conditions.push(inArray(bookAuthor.id, params.books));
      } else {
        conditions.push(eq(bookAuthor.id, params.books[0]));
      }
    }

    if (!!params?.subjects?.length) {
      if (params.subjects.length > 1) {
        conditions.push(inArray(bookAuthor.subjectId, params.subjects));
      } else {
        conditions.push(eq(bookAuthor.subjectId, params.subjects[0]));
      }
    }

    if (!!params?.editions?.length) {
      if (params.editions.length > 1) {
        conditions.push(inArray(bookAuthor.edition, params.editions));
      } else {
        conditions.push(eq(bookAuthor.edition, params.editions[0]));
      }
    }

    if (params?.marked !== undefined) {
      conditions.push(eq(bookAuthor.marked, params.marked));
    }

    if (params?.query) {
      conditions.push(ilike(bookAuthor.name, `%${params?.query}%`));
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
        if (col === "name") return bookAuthor.name;
        if (col === "createdAt") return bookAuthor.createdAt;
        if (col === "edition") return bookAuthor.edition;
        return bookAuthor.createdAt; // default
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
