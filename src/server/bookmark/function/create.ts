import { createServerFn } from "@tanstack/react-start";
import { authed } from "@/server/middleware";
import {
	toggleBookmark,
	toggleBookmarkSchema,
	createBookmark,
	createBookmarkSchema,
	deleteBookmark,
	deleteBookmarkSchema,
} from "../service/create";

export const toggleBookmarkFn = createServerFn({ method: "POST" })
	.middleware([authed])
	.validator(toggleBookmarkSchema)
	.handler(async ({ data: params, context }) => {
		const result = await toggleBookmark({
			...params,
			userId: context.user.id,
		});
		return result;
	});

export const createBookmarkFn = createServerFn({ method: "POST" })
	.middleware([authed])
	.validator(createBookmarkSchema)
	.handler(async ({ data: params, context }) => {
		const result = await createBookmark({
			...params,
			userId: context.user.id,
		});
		return result;
	});

export const deleteBookmarkFn = createServerFn({ method: "POST" })
	.middleware([authed])
	.validator(deleteBookmarkSchema)
	.handler(async ({ data: params, context }) => {
		const result = await deleteBookmark({
			...params,
			userId: context.user.id,
		});
		return result;
	});
