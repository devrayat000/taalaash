import { createServerFn } from "@tanstack/react-start";
import db from "@/lib/db";
import { mapKeys, camelCase } from "lodash";

import { post, subject, chapter, bookAuthor, users } from "@/db/schema";
import { count, sql } from "drizzle-orm";

const statsStatement = sql`
SELECT
    (SELECT COUNT(*) FROM ${users}) AS user_count,
    (SELECT COUNT(*) FROM ${subject}) AS subject_count,
    (SELECT COUNT(*) FROM ${bookAuthor}) AS book_author_count,
    (SELECT COUNT(*) FROM ${chapter}) AS chapter_count,
    (SELECT COUNT(*) FROM ${post}) AS post_count;
`;
// TODO: A thought for later: If you want to use the `db.select` syntax, you can do it like this:
// let a = await db.select({
//   userCount: db.select({count: count()}).from(users).as('sq').count,
// })
export type Stats = {
  userCount: number;
  subjectCount: number;
  bookAuthorCount: number;
  chapterCount: number;
  postCount: number;
};

export const getStats = createServerFn({ method: "GET" }).handler(
  async (): Promise<Stats> => {
    const [stats] = await db.execute<Stats>(statsStatement);
    return mapKeys(stats, (_, key) => camelCase(key)) as any;
  }
);
