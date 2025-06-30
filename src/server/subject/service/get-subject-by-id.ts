import { createServerFn } from "@tanstack/react-start";
import { string } from "valibot";
import { subject } from "@/db/schema";
import db from "@/lib/db";
import { eq } from "drizzle-orm";
import { type SubjectData } from "./get-filtered-subjects";

export const getSubjectById = createServerFn({ method: "GET" })
  .validator(string())
  .handler(async ({ data: id }): Promise<SubjectData | null> => {
    const subjectData = await db
      .select({
        id: subject.id,
        name: subject.name,
        createdAt: subject.createdAt,
      })
      .from(subject)
      .where(eq(subject.id, id))
      .limit(1)
      .execute();

    return subjectData[0] || null;
  });
