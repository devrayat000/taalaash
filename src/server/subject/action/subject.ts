import { subject } from "@/db/schema";
import db from "@/lib/db";
import { createServerFn } from "@tanstack/react-start";
import { eq, inArray } from "drizzle-orm";
import { z } from "zod";

export const createSubject = createServerFn({ method: "POST" })
	.validator(
		z.object({
			name: z.string(),
		}),
	)
	.handler(async ({ data: params }) => {
		const [data] = await db
			.insert(subject)
			.values(params)
			.returning({ id: subject.id });
		// revalidatePath("/admin/subjects");
		// redirect("/admin/subjects");
		return data;
	});

export const updateSubject = createServerFn({ method: "POST" })
	.validator(
		z.object({
			id: z.string(),
			params: z.object({
				name: z.string().optional(),
			}),
		}),
	)
	.handler(async ({ data: { id, params } }) => {
		await db.update(subject).set(params).where(eq(subject.id, id));
		// revalidatePath("/admin/subjects");
		// redirect("/admin/subjects");
		// return data;
	});

export const deleteSubject = createServerFn({ method: "POST" })
	.validator(
		z.object({
			id: z.string(),
		}),
	)
	.handler(async ({ data: { id } }) => {
		await db.delete(subject).where(eq(subject.id, id));
		// revalidatePath("/admin/subjects");
		// redirect("/admin/subjects");
	});

export const deleteManySubjects = createServerFn()
	.validator(
		z.object({
			ids: z.array(z.string()),
		}),
	)
	.handler(async ({ data: { ids } }) => {
		await db.delete(subject).where(inArray(subject.id, ids));
		// revalidatePath("/admin/subjects");
		// redirect(`/admin/subjects`);
	});
