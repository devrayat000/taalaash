import { withCache } from "@/hooks/use-cache";
import { users } from "@/db/auth";
import db from "@/lib/db";
import { count, desc, sql } from "drizzle-orm";

const dailyUserStatement = db
	.select({
		count: count().as("user_count"),
	})
	.from(users)
	.prepare("get_user_count_statement");

const dailyUserCountStatement = db
	.select({
		count: count(users.id).as("user_count"),
		created_date:
			sql`to_date(to_char(${users.createdAt}, 'DD Mon YYYY'), 'DD Mon YYYY')`
				.mapWith(String)
				.as("created_date"),
	})
	.from(users)
	.groupBy(sql`created_date`)
	.orderBy(desc(sql`created_date`))
	.limit(7)
	.prepare("get_daily_user_count_statement");

export const getUserCount = withCache(
	async () => {
		const [{ count }] = await dailyUserStatement.execute();
		console.log({ count });
		return count;
	},
	{
		tags: ["users", "user-count"],
		ttl: 300, // 5 minutes
	},
);

export const getDailyUserCount = withCache(
	async () => {
		const dailyUserCount = await dailyUserCountStatement.execute();
		return dailyUserCount;
	},
	{
		tags: ["users", "daily-user-count"],
		ttl: 1800, // 30 minutes
	},
);
