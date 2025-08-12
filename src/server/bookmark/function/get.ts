import { createServerFn } from "@tanstack/react-start";
import { setHeader } from "@tanstack/react-start/server";
import { authed } from "@/server/middleware";
import {
	getBookmarkedPosts,
	getBookmarkedList,
	getBookmarkedPostsByProviderId,
	getBookmarkedPostsByProviderIdSchema,
} from "../service/get";

export const getBookmarkedPostsFn = createServerFn({ method: "GET" })
	.middleware([authed])
	.handler(async ({ context }) => {
		const { data, __meta } = await getBookmarkedPosts({
			userId: context.user.id,
		});

		if (__meta.ttl !== null) {
			setHeader("Cache-Control", `public, max-age=0, s-maxage=${__meta.ttl}`);
			setHeader("X-Cache", __meta.hit ? "HIT" : "MISS");
		}

		return data;
	});

export const getBookmarkedListFn = createServerFn({ method: "GET" })
	.middleware([authed])
	.handler(async ({ context }) => {
		const { data, __meta } = await getBookmarkedList({
			userId: context.user.id,
		});

		if (__meta.ttl !== null) {
			setHeader("Cache-Control", `public, max-age=0, s-maxage=${__meta.ttl}`);
			setHeader("X-Cache", __meta.hit ? "HIT" : "MISS");
		}

		return data;
	});

export const getBookmarkedPostsByProviderIdFn = createServerFn({
	method: "GET",
})
	.validator(getBookmarkedPostsByProviderIdSchema)
	.handler(async ({ data: { accountId } }) => {
		const { data, __meta } = await getBookmarkedPostsByProviderId({
			accountId,
		});

		if (__meta.ttl !== null) {
			setHeader("Cache-Control", `public, max-age=0, s-maxage=${__meta.ttl}`);
			setHeader("X-Cache", __meta.hit ? "HIT" : "MISS");
		}

		return data;
	});
