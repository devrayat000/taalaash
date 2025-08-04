import { invalidateTags } from "@/hooks/use-cache";
import { chapter } from "@/db/schema";
import db from "@/lib/db";
import { eq, inArray } from "drizzle-orm";
import { object, uuid, array, type infer as Infer } from "zod/mini";

export const deleteChapterSchema = object({
	id: uuid(),
});

export const deleteManyChaptersSchema = object({
	ids: array(uuid()),
});

export async function deleteChapter(params: Infer<typeof deleteChapterSchema>) {
	const deletedChapter = await db
		.delete(chapter)
		.where(eq(chapter.id, params.id))
		.returning()
		.execute();

	await invalidateTags("chapters", `chapter:${params.id}`);

	return deletedChapter[0];
}

export async function deleteManyChapters(
	params: Infer<typeof deleteManyChaptersSchema>,
) {
	const deletedChapters = await db
		.delete(chapter)
		.where(inArray(chapter.id, params.ids))
		.returning()
		.execute();

	await invalidateTags("chapters", ...params.ids.map((id) => `chapter:${id}`));

	return deletedChapters;
}
