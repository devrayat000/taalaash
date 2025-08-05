import { withCache } from "@/hooks/use-cache";
import { optional, object, string, trim, type infer as Infer } from "zod/mini";
import { post, chapter } from "@/db/schema";
import db from "@/lib/db";
import { count, eq, ilike } from "drizzle-orm";

export const countPostsSchema = optional(
	object({
		query: optional(string().check(trim())),
	}),
);

export const countPosts = withCache(
	async (params: Infer<typeof countPostsSchema>) => {
		if (params?.query) {
			const [{ count: postCount }] = await db
				.select({ count: count() })
				.from(post)
				.innerJoin(chapter, eq(post.chapterId, chapter.id))
				.where(ilike(chapter.name, `%${params.query}%`))
				.execute();
			return postCount;
		} else {
			const [{ count: postCount }] = await db
				.select({ count: count() })
				.from(post)
				.execute();
			return postCount;
		}
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
