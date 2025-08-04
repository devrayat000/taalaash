import { subject } from "@/db/topic";
import { invalidateTags } from "@/hooks/use-cache";
import db from "@/lib/db";
import { eq } from "drizzle-orm";
import { object, string, optional, type infer as Infer } from "zod/mini";

export const updateSubjectSchema = object({
	id: string(),
	params: object({
		name: optional(string()),
	}),
});

export async function updateSubject(params: Infer<typeof updateSubjectSchema>) {
	const data = await db
		.update(subject)
		.set(params)
		.where(eq(subject.id, params.id))
		.returning();

	await invalidateTags("subjects", `subject:${params.id}`);
	return data;
}
