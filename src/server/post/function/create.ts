import { createServerFn } from "@tanstack/react-start";
import { array, union } from "zod/mini";
import {
	createPost,
	createPostSchema,
	updatePost,
	updatePostSchema,
} from "../service/create";

export const createPostFn = createServerFn({ method: "POST" })
	.validator(union([createPostSchema, array(createPostSchema)]))
	.handler(async ({ data: params }) => {
		return await createPost(params);
	});

export const updatePostFn = createServerFn({ method: "POST" })
	.validator(updatePostSchema)
	.handler(async ({ data: params }) => {
		return await updatePost(params);
	});
