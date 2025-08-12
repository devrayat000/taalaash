import { createServerFn } from "@tanstack/react-start";
import { optional, string } from "valibot";
import { countSubjects } from "../service/count";
import { setHeader } from "@tanstack/react-start/server";

export const countSubjectsFn = createServerFn({ method: "GET" })
	.validator(optional(string()))
	.handler(async ({ data: query }) => {
		const { data, __meta } = await countSubjects({ query });

		if (__meta.ttl !== null) {
			setHeader("Cache-Control", `public, max-age=0, s-maxage=${__meta.ttl}`);
			setHeader("X-Cache", __meta.hit ? "HIT" : "MISS");
		}

		return data;
	});
