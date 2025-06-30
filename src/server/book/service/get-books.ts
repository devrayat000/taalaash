import { createServerFn } from "@tanstack/react-start";
import { optional, object, number, string } from "valibot";
import { eq, ilike } from "drizzle-orm";
import db from "@/lib/db";
import { bookAuthor, subject } from "@/db/schema";
import { GetParams, GetResults } from "../../types";
import { countBooks } from "./count-books";

// Define the return type for the table
export type BookTable = {
  id: string;
  name: string;
  edition: string;
  marked: boolean;
  subject: {
    id: string;
    name: string;
    createdAt: Date;
  };
};

const getBooksSchema = optional(
  object({
    page: optional(number()),
    limit: optional(number()),
    query: optional(string()),
  })
);

export const getBooks = createServerFn({ method: "GET" })
  .validator(getBooksSchema)
  .handler(async ({ data: params }) => {
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const query = params?.query;

    // Build the query with pagination and search
    let queryBuilder = db
      .select({
        id: bookAuthor.id,
        name: bookAuthor.name,
        edition: bookAuthor.edition,
        marked: bookAuthor.marked,
        subject: {
          id: subject.id,
          name: subject.name,
          createdAt: subject.createdAt,
        },
      })
      .from(bookAuthor)
      .innerJoin(subject, eq(bookAuthor.subjectId, subject.id)) as any;

    // Apply search filter if provided
    if (query) {
      queryBuilder = queryBuilder.where(ilike(bookAuthor.name, `%${query}%`));
    }

    // Apply pagination
    queryBuilder = queryBuilder.offset((page - 1) * limit).limit(limit);

    const [data, count] = await Promise.all([
      queryBuilder.execute(),
      countBooks({ data: query }),
    ]);

    return { data, count };
  });
