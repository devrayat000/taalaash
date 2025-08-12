import { z } from "zod/mini";

const bookSchema = z.object({
	name: z.string().check(z.minLength(1), z.trim()),
	subjectId: z.string().check(z.minLength(1)),
	edition: z.string().check(z.minLength(1), z.trim()),
	marked: z._default(z.boolean(), false),
});

export const createBookServerSchema = z.extend(bookSchema, {
	coverUrl: z.url().check(z.trim()),
});
