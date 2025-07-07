import type { InferSelectModel } from "drizzle-orm";
import { eq, inArray } from "drizzle-orm";

import { bookAuthor } from "@/db/schema";
import db from "@/lib/db";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const createBookSchema = z.object({
	name: z.string(),
	subjectId: z.string(),
	edition: z.string(),
	marked: z.boolean().default(false),
	coverUrl: z.string().optional(),
});

const updateBookSchema = z.object({
	id: z.string(),
	params: z.object({
		name: z.string().optional(),
		subjectId: z.string().optional(),
		edition: z.string().optional(),
		marked: z.boolean().optional(),
		coverUrl: z.string().optional(),
	}),
});

export const createBook = createServerFn({ method: "POST" })
	.validator(createBookSchema)
	.handler(async ({ data: { data: input } }) => {
		const [data] = await db
			.insert(bookAuthor)
			.values(input)
			.returning({ id: bookAuthor.id });

		return data;
	});

export const updateBook = createServerFn({ method: "POST" })
	.validator(updateBookSchema)
	.handler(async ({ data: { id, params } }) => {
		await db.update(bookAuthor).set(params).where(eq(bookAuthor.id, id));
		// revalidatePath("/admin/books");
		// redirect("/admin/books");
		// return data;
	});

export const deleteBook = createServerFn({ method: "POST" })
	.validator(
		z.object({
			id: z.string(),
		}),
	)
	.handler(async ({ data: { id } }) => {
		await db.delete(bookAuthor).where(eq(bookAuthor.id, id));
		// revalidatePath("/admin/books");
		// redirect("/admin/books");
	});

export const getBooksBySubject = createServerFn({ method: "GET" })
	.validator(
		z.object({
			id: z.string(),
		}),
	)
	.handler(async ({ data: { id } }) => {
		const books = await db
			.select({
				id: bookAuthor.id,
				name: bookAuthor.name,
			})
			.from(bookAuthor)
			.where(eq(bookAuthor.subjectId, id))
			.execute();

		return books;
	});

export const deleteManyBooks = createServerFn({ method: "POST" })
	.validator(
		z.object({
			ids: z.array(z.string()),
		}),
	)
	.handler(async ({ data: { ids } }) => {
		await db.delete(bookAuthor).where(inArray(bookAuthor.id, ids));
		// revalidatePath("/admin/books");
		// redirect(`/admin/books`);
	});
