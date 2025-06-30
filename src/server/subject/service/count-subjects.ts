import { createServerFn } from "@tanstack/react-start";
import { optional, string } from "valibot";
import { subject } from "@/db/schema";
import db from "@/lib/db";
import { count, ilike, sql, eq } from "drizzle-orm";

const subjectCountStatement = db
  .select({ count: count() })
  .from(subject)
  .where(ilike(subject.name, sql.placeholder("query")))
  .prepare("get_subject_count");

export const countSubjects = createServerFn({ method: "GET" })
  .validator(optional(string()))
  .handler(async ({ data: query }) => {
    query = `%${query ?? ""}%`;

    const [{ count }] = await subjectCountStatement.execute({ query });

    return count;
  });
