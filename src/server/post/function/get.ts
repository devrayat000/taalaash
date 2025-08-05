import { createServerFn } from "@tanstack/react-start";
import { setHeader } from "@tanstack/react-start/server";
import { authed } from "@/server/middleware";
import {
	getPostById,
	getPostByIdSchema,
	getPostByIdForIndexing,
	getPosts,
	getPostsSchema,
} from "../service/get";

export const getPostsFn = createServerFn({ method: "GET" })
	.middleware([authed])
	.validator(getPostsSchema)
	.handler(async ({ data: params }) => {
		const { data, __meta } = await getPosts(params);

		if (__meta.ttl !== null) {
			setHeader("Cache-Control", `public, max-age=0, s-maxage=${__meta.ttl}`);
			setHeader("X-Cache", __meta.hit ? "HIT" : "MISS");
		}

		return data;
	});

export const getPostByIdFn = createServerFn({ method: "GET" })
	.validator(getPostByIdSchema)
	.handler(async ({ data: params }) => {
		const { data, __meta } = await getPostById(params);

		if (__meta.ttl !== null) {
			setHeader("Cache-Control", `public, max-age=0, s-maxage=${__meta.ttl}`);
			setHeader("X-Cache", __meta.hit ? "HIT" : "MISS");
		}

		return data;
	});

export const getPostByIdForIndexingFn = createServerFn({ method: "GET" })
	.validator(getPostByIdSchema)
	.handler(async ({ data: params }) => {
		const { data, __meta } = await getPostByIdForIndexing(params);

		if (__meta.ttl !== null) {
			setHeader("Cache-Control", `public, max-age=0, s-maxage=${__meta.ttl}`);
			setHeader("X-Cache", __meta.hit ? "HIT" : "MISS");
		}

		return data;
	});
