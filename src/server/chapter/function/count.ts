import { createServerFn } from "@tanstack/react-start";
import { setHeader } from "@tanstack/react-start/server";
import { countChapters, countChaptersSchema } from "../service/count";
import { isAdmin } from "@/server/middleware";

export const countChaptersFn = createServerFn({ method: "GET" })
	.middleware([isAdmin])
	.validator(countChaptersSchema)
	.handler(async ({ data: params }) => {
		const { data, __meta } = await countChapters(params);

		if (__meta.ttl !== null) {
			setHeader("Cache-Control", `public, max-age=0, s-maxage=${__meta.ttl}`);
			setHeader("X-Cache", __meta.hit ? "HIT" : "MISS");
		}

		return data;
	});
