import { z } from "zod/mini";

export const filterSchema = z._default(
	z.pipe(
		z.union([z.string(), z.array(z.string())]),
		z.transform((val) => (Array.isArray(val) ? val : [val]).filter(Boolean)),
	),
	[],
);

type FilterInput = z.input<typeof filterSchema>;
type FilterOutput = z.output<typeof filterSchema>;
type FilterSchema = z.infer<typeof filterSchema>;

// const filterSchema = z
// 	.preprocess((x) => {
// 		if (typeof x === "string") {
// 			return [x];
// 		}
// 		if (Array.isArray(x) && x.length > 0) {
// 			return x;
// 		}
// 		return [];
// 	}, z.array(z.string()))
// 	.default([]);

export const searchSchema = z.object({
	query: z.string(),
	page: z._default(
		z.pipe(
			z.union([z.string(), z.int().check(z.positive())]),
			z.transform((val) => (typeof val === "string" ? parseInt(val) : val)),
		),
		1,
	),
	subjects: filterSchema,
	chapters: filterSchema,
	books: filterSchema,
	limit: z._default(z.optional(z.int().check(z.positive())), 12),
});

export type SearchSchema = z.infer<typeof searchSchema>;
