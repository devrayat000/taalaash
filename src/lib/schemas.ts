import { z } from "zod/mini";

export const searchParamsSchema = z.object({
	query: z.string(),
	page: z._default(
		z.pipe(
			z.union([z.string(), z.number()]),
			z.transform((val) => (typeof val === "string" ? parseInt(val) : val)),
		),
		1,
	),
	limit: z._default(
		z.pipe(
			z.union([z.string(), z.number()]),
			z.transform((val) => (typeof val === "string" ? parseInt(val) : val)),
		),
		10,
	),
});
