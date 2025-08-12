import { createServerFn } from "@tanstack/react-start";
import { setHeader } from "@tanstack/react-start/server";
import { countBooks, countBooksSchema } from "../service/count";

export const countBooksFn = createServerFn({ method: "GET" })
	.validator(countBooksSchema)
	.handler(async ({ data: params }) => {
		const { data, __meta } = await countBooks(params);

		if (__meta.ttl !== null) {
			setHeader("Cache-Control", `public, max-age=0, s-maxage=${__meta.ttl}`);
			setHeader("X-Cache", __meta.hit ? "HIT" : "MISS");
		}

		return data;
	});
