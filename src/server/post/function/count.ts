import { createServerFn } from "@tanstack/react-start";
import { setHeader } from "@tanstack/react-start/server";
import { countPosts, countPostsSchema } from "../service/count";

export const countPostsFn = createServerFn({ method: "GET" })
	.validator(countPostsSchema)
	.handler(async ({ data: params }) => {
		const { data, __meta } = await countPosts(params);

		if (__meta.ttl !== null) {
			setHeader("Cache-Control", `public, max-age=0, s-maxage=${__meta.ttl}`);
			setHeader("X-Cache", __meta.hit ? "HIT" : "MISS");
		}

		return data;
	});
