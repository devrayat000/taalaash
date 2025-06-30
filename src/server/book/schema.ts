import { z } from "zod";

const bookSchema = z.object({
  name: z.string().min(1).trim(),
  subjectId: z.string().min(1),
  edition: z.string().min(1).trim(),
  marked: z.boolean().default(false),
});

export const createBookServerSchema = bookSchema.extend({
  coverUrl: z.string().min(1).url().trim(),
});
