import { chapter } from "@/db/schema";
import db from "@/lib/db";
import { createServerFn } from "@tanstack/react-start";
import type { InferSelectModel } from "drizzle-orm";
import { eq, inArray } from "drizzle-orm";
import { z } from "zod";

export const createChapter = createServerFn({ method: "POST" })
	.validator(
		z.object({
			name: z.string(),
			bookAuthorId: z.string(),
		}),
	)
	.handler(async ({ data: params }) => {
		const [data] = await db
			.insert(chapter)
			.values(params)
			.returning({ id: chapter.id });
		// revalidatePath("/admin/chapters");
		// redirect("/admin/chapters");
		return data;
	});

export const updateChapter = createServerFn({ method: "POST" })
	.validator(
		z.object({
			id: z.string(),
			params: z.object({
				name: z.string().optional(),
				bookAuthorId: z.string().optional(),
			}),
		}),
	)
	.handler(async ({ data: { id, params } }) => {
		await db.update(chapter).set(params).where(eq(chapter.id, id));
		// revalidatePath("/admin/chapters");
		// redirect("/admin/chapters");
		// return data;
	});

export const deleteChapter = createServerFn({ method: "POST" })
	.validator(
		z.object({
			id: z.string(),
		}),
	)
	.handler(async ({ data: { id } }) => {
		await db.delete(chapter).where(eq(chapter.id, id));
		// revalidatePath("/admin/chapters");
		// redirect("/admin/chapters");
	});

export const getChaptersByBooks = createServerFn({ method: "GET" })
	.validator(
		z.object({
			id: z.string(),
		}),
	)
	.handler(async ({ data: { id: bookAuthorId } }) => {
		const chapters = await db
			.select({
				id: chapter.id,
				name: chapter.name,
			})
			.from(chapter)
			.where(eq(chapter.bookAuthorId, bookAuthorId))
			.execute();

		return chapters;
	});

export const deleteManyChapters = createServerFn({ method: "POST" })
	.validator(z.object({ ids: z.array(z.string()) }))
	.handler(async ({ data: { ids } }) => {
		await db.delete(chapter).where(inArray(chapter.id, ids));
		// revalidatePath("/admin/chapters");
		// redirect(`/admin/chapters`);
	});
