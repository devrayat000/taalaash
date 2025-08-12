import { subject } from "@/db/topic";
import { withCache } from "@/hooks/use-cache";
import db from "@/lib/db";
import { count, ilike } from "drizzle-orm";
import { object, optional, string, type infer as Infer } from "zod/mini";

export const countSubjectSchema = object({
	query: optional(string()),
});

export const countSubjects = withCache(
	async ({ query }: Infer<typeof countSubjectSchema>) => {
		let queryBuilder = db
			.select({ count: count(subject.id) })
			.from(subject)
			.$dynamic();

		if (query) {
			queryBuilder = queryBuilder.where(ilike(subject.name, `%${query}%`));
		}

		const result = await queryBuilder.execute();
		return result[0]?.count ?? 0;
	},
	{
		tags: ["subjects"],
		ttl: 60,
	},
);
