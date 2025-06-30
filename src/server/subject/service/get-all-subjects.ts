import { createServerFn } from "@tanstack/react-start";
import db from "@/lib/db";
import { subject } from "@/db/schema";
import { type SubjectData } from "./get-filtered-subjects";

export const getAllSubjects = createServerFn({ method: "GET" }).handler(
  async (): Promise<SubjectData[]> => {
    return db
      .select({
        id: subject.id,
        name: subject.name,
        createdAt: subject.createdAt,
      })
      .from(subject)
      .execute();
  }
);
