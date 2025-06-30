import { z } from "zod";

const filterSchema = z
  .preprocess((x) => {
    if (typeof x === "string") {
      return [x];
    }
    if (Array.isArray(x) && x.length > 0) {
      return x;
    }
    return [];
  }, z.array(z.string()))
  .default([]);

export const searchSchema = z.object({
  query: z.string(),
  page: z.preprocess((x) => {
    if (typeof x === "string") {
      return parseInt(x);
    }
    if (typeof x === "number") {
      return x;
    }
    return 1;
  }, z.number().default(1)),
  subjects: filterSchema,
  chapters: filterSchema,
  books: filterSchema,
});

export type SearchSchema = z.infer<typeof searchSchema>;
