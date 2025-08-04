import { invalidateTags } from "@/hooks/use-cache";
import { chapter } from "@/db/schema";
import db from "@/lib/db";
import { eq } from "drizzle-orm";
import { object, string, uuid, optional, type infer as Infer } from "zod/mini";

export const createChapterSchema = object({
	name: string(),
	bookAuthorId: uuid(),
});

export const updateChapterSchema = object({
	id: uuid(),
	params: object({
		name: optional(string()),
		bookAuthorId: optional(uuid()),
	}),
});

export async function createChapter(params: Infer<typeof createChapterSchema>) {
	const [data] = await db
		.insert(chapter)
		.values(params)
		.returning({ id: chapter.id });

	await invalidateTags("chapters", `book:${params.bookAuthorId}`);
	return data;
}

export async function updateChapter(params: Infer<typeof updateChapterSchema>) {
	const { id, params: updateParams } = params;

	const [data] = await db
		.update(chapter)
		.set(updateParams)
		.where(eq(chapter.id, id))
		.returning();

	await invalidateTags("chapters", `chapter:${id}`);

	if (updateParams.bookAuthorId) {
		await invalidateTags(`book:${updateParams.bookAuthorId}`);
	}

	return data;
}
