import { createServerFn } from "@tanstack/react-start";
import { object, optional, string, array, number } from "valibot";
import { subject } from "@/db/schema";
import db from "@/lib/db";
import { GetParams } from "@/server/types";
import { SQL, and, eq, ilike, inArray } from "drizzle-orm";

interface GetFilteredSubjectsParams extends GetParams {
  subjects?: string[];
}

const getFilteredSubjectsSchema = object({
  subjects: optional(array(string())),
  page: optional(number()),
  limit: optional(number()),
  query: optional(string()),
  orderBy: optional(array(string())),
});

export const getFilteredSubjects = createServerFn({ method: "POST" })
  .validator(getFilteredSubjectsSchema)
  .handler(async ({ data: params }) => {
    // Select all fields from subject
    const baseQuery = db
      .select({
        id: subject.id,
        name: subject.name,
        createdAt: subject.createdAt,
      })
      .from(subject);

    // Conditions
    let conditions: (SQL<unknown> | undefined)[] = [];

    if (!!params?.subjects?.length) {
      if (params.subjects.length > 1) {
        conditions.push(inArray(subject.id, params.subjects));
      } else {
        conditions.push(eq(subject.id, params.subjects[0]));
      }
    }

    if (params?.query) {
      conditions.push(ilike(subject.name, `%${params?.query}%`));
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
        if (col === "name") return subject.name;
        if (col === "createdAt") return subject.createdAt;
        return subject.createdAt; // default
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
export type SubjectData = {
  id: string;
  name: string;
  createdAt: Date;
};
