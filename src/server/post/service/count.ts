import { withCache } from "@/hooks/use-cache";
import { optional, object, string, trim, type infer as Infer } from "zod/mini";
import { post } from "@/db/schema";
import db from "@/lib/db";
import { count } from "drizzle-orm";

export const countPostsSchema = optional(
	object({
		query: optional(string().check(trim())),
	}),
);

const postCountStatement = db
	.select({ count: count() })
	.from(post)
	.prepare("get_post_count");

export const countPosts = withCache(
	async (_params: Infer<typeof countPostsSchema>) => {
		const [{ count }] = await postCountStatement.execute();
		return count;
	},
	{
		tags: (params) => [
			"posts",
			"post-count",
			...(params?.query ? [`post-search:${params.query}`] : []),
		],
		ttl: 300, // 5 minutes
	},
);
