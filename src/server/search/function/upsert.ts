import { createServerFn } from "@tanstack/react-start";
import { upsertPosts, upsertPostsSchema } from "../service/upsert";
import { isAdmin } from "@/server/middleware";

export const upsertPostsFn = createServerFn({ method: "POST" })
	.middleware([isAdmin])
	.validator(upsertPostsSchema)
	.handler(async ({ data: params }) => {
		await upsertPosts(params);
	});
