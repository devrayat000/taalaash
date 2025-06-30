import { createServerFn } from "@tanstack/react-start";
import { optional, object, number, string } from "valibot";
import { ilike, desc } from "drizzle-orm";
import db from "@/lib/db";
import { subject } from "@/db/schema";
import { countSubjects } from "./count-subjects";

export type SubjectTable = {
  id: string;
  name: string;
  createdAt: Date;
};

const getSubjectsSchema = optional(
  object({
    page: optional(number()),
    limit: optional(number()),
    query: optional(string()),
  })
);

export const getSubjects = createServerFn({ method: "GET" })
  .validator(getSubjectsSchema)
  .handler(async ({ data: params }) => {
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const query = params?.query?.trim();

    // Build the query
    let queryBuilder = db
      .select({
        id: subject.id,
        name: subject.name,
        createdAt: subject.createdAt,
      })
      .from(subject) as any;

    // Apply search filter if provided
    if (query) {
      queryBuilder = queryBuilder.where(ilike(subject.name, `%${query}%`));
    }

    // Apply ordering and pagination
    queryBuilder = queryBuilder
      .orderBy(desc(subject.createdAt))
      .offset((page - 1) * limit)
      .limit(limit);

    const [data, count] = await Promise.all([
      queryBuilder.execute(),
      countSubjects({ data: query }),
    ]);

    return { data, count };
  });
