import { withCache } from "@/hooks/use-cache";
import {
	optional,
	object,
	number,
	string,
	int,
	positive,
	type infer as Infer,
	uuid,
	array,
	trim,
} from "zod/mini";
import { ilike, eq, type SQL, and, inArray } from "drizzle-orm";
import db from "@/lib/db";
import { subject } from "@/db/schema";

export const getSubjectsSchema = optional(
	object({
		subjects: optional(array(uuid())),
		page: optional(number().check(int()).check(positive())),
		limit: optional(number().check(int()).check(positive())),
		query: optional(string().check(trim())),
	}),
);

export const getSubjects = withCache(
	async (params: Infer<typeof getSubjectsSchema>) => {
		const query = params?.query?.trim();

		// Build the query
		let queryBuilder = db
			.select({
				id: subject.id,
				name: subject.name,
				createdAt: subject.createdAt,
			})
			.from(subject)
			.$dynamic();

		// Conditions
		let conditions: (SQL<unknown> | undefined)[] = [];

		if (!!params?.subjects?.length) {
			if (params.subjects.length > 1) {
				conditions.push(inArray(subject.id, params.subjects));
			} else {
				conditions.push(eq(subject.id, params.subjects[0]));
			}
		}

		// Apply search filter if provided
		if (query) {
			conditions.push(ilike(subject.name, `%${params?.query}%`));
		}

		// Apply conditions
		if (!!conditions.length) {
			if (conditions.length > 1) {
				queryBuilder = queryBuilder.where(and(...conditions));
			} else {
				queryBuilder = queryBuilder.where(conditions[0]);
			}
		}

		if (params?.page && params.limit) {
			queryBuilder = queryBuilder.offset((params.page - 1) * params.limit);
		}
		if (params?.limit) {
			queryBuilder = queryBuilder.limit(params.limit);
		}

		return queryBuilder.execute();
	},
	{
		tags: ["subjects"],
		ttl: 60,
	},
);

export const getSubjectByIdSchema = object({
	id: uuid(),
});

export const getSubjectById = withCache(
	async ({ data: id }) => {
		const subjectData = await db
			.select({
				id: subject.id,
				name: subject.name,
				createdAt: subject.createdAt,
			})
			.from(subject)
			.where(eq(subject.id, id))
			.limit(1)
			.execute();

		return subjectData[0] || null;
	},
	{
		prefix: "subject",
		tags: (params) => [`subject:${params.id}`],
		ttl: 3600,
	},
);
