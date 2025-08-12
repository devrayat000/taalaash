import { subject } from "@/db/topic";
import { invalidateTags } from "@/hooks/use-cache";
import db from "@/lib/db";
import { object, string, type infer as Infer } from "zod/mini";

export const createSubjectSchema = object({
	name: string(),
});

export async function createSubject(params: Infer<typeof createSubjectSchema>) {
	const [data] = await db
		.insert(subject)
		.values(params)
		.returning({ id: subject.id });

	await invalidateTags("subjects");
	return data;
}
