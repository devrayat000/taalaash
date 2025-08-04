import { subject } from "@/db/topic";
import { invalidateTags } from "@/hooks/use-cache";
import db from "@/lib/db";
import { eq, inArray } from "drizzle-orm";
import { object, uuid, array, type infer as Infer } from "zod/mini";

export const deleteSubjectSchema = object({
	id: uuid(),
});

export async function deleteSubject(params: Infer<typeof deleteSubjectSchema>) {
	const deletedSubject = await db
		.delete(subject)
		.where(eq(subject.id, params.id))
		.returning()
		.execute();

	await invalidateTags("subjects", `subject:${params.id}`);

	return deletedSubject[0];
}

export const deleteManySubjectsSchema = object({
	ids: array(uuid()),
});

export async function deleteManySubjects(
	params: Infer<typeof deleteManySubjectsSchema>,
) {
	const deletedSubjects = await db
		.delete(subject)
		.where(inArray(subject.id, params.ids))
		.returning()
		.execute();

	await invalidateTags("subjects", ...params.ids.map((id) => `subject:${id}`));

	return deletedSubjects;
}
