import { createServerFn } from "@tanstack/react-start";
import { optional, string } from "valibot";
import { subject } from "@/db/schema";
import db from "@/lib/db";
import { count, ilike } from "drizzle-orm";

export const countSubjects = createServerFn({ method: "GET" })
	.validator(optional(string()))
	.handler(async ({ data: query }) => {
		query = `%${query ?? ""}%`;

		let queryBuilder = db
			.select({ count_user: count() })
			.from(subject)
			.$dynamic();
		if (query) {
			queryBuilder = queryBuilder.where(ilike(subject.name, query));
		}

		const [{ count_user }] = await queryBuilder.execute();

		return count_user;
	});
