import { createServerFn } from "@tanstack/react-start";
import { optional, object, number, string } from "valibot";
import { eq, ilike, desc } from "drizzle-orm";
import db from "@/lib/db";
import { bookAuthor, chapter, subject } from "@/db/schema";
import { countChapters } from "./count-chapters";

export type ChapterTable = {
  id: string;
  name: string;
  book: {
    name: string;
    id: string;
  };
  subject: {
    name: string;
    id: string;
  };
};

const getChaptersSchema = optional(
  object({
    page: optional(number()),
    limit: optional(number()),
    query: optional(string()),
  })
);

export const getChapters = createServerFn({ method: "GET" })
  .validator(getChaptersSchema)
  .handler(async ({ data: params }) => {
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const query = params?.query?.trim();

    // Build the query with joins
    let queryBuilder = db
      .select({
        id: chapter.id,
        name: chapter.name,
        book: {
          name: bookAuthor.name,
          id: bookAuthor.id,
        },
        subject: {
          name: subject.name,
          id: subject.id,
        },
      })
      .from(chapter)
      .innerJoin(bookAuthor, eq(chapter.bookAuthorId, bookAuthor.id))
      .innerJoin(subject, eq(bookAuthor.subjectId, subject.id)) as any;

    // Apply search filter if provided
    if (query) {
      queryBuilder = queryBuilder.where(ilike(chapter.name, `%${query}%`));
    }

    // Apply ordering and pagination
    queryBuilder = queryBuilder
      .orderBy(desc(chapter.name))
      .offset((page - 1) * limit)
      .limit(limit);

    const [data, count] = await Promise.all([
      queryBuilder.execute(),
      countChapters({ data: query }),
    ]);

    return { data, count };
  });
