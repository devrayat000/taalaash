import { createServerFn } from "@tanstack/react-start";
import { authed } from "@/server/middleware";
import {
	deletePost,
	deletePostSchema,
	deleteManyPosts,
	deleteManyPostsSchema,
} from "../service/delete";

export const deletePostFn = createServerFn({ method: "POST" })
	.middleware([authed])
	.validator(deletePostSchema)
	.handler(async ({ data: params }) => {
		const data = await deletePost(params);
		return data;
	});

export const deleteManyPostsFn = createServerFn({ method: "POST" })
	.middleware([authed])
	.validator(deleteManyPostsSchema)
	.handler(async ({ data: params }) => {
		const data = await deleteManyPosts(params);
		return data;
	});
