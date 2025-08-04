import { createServerFn } from "@tanstack/react-start";
import { setHeader } from "@tanstack/react-start/server";
import { getUserCount, getDailyUserCount } from "../service/get";
import { isAdmin } from "@/server/middleware";

export const getUserCountFn = createServerFn({ method: "GET" })
	.middleware([isAdmin])
	.handler(async () => {
		const { data, __meta } = await getUserCount();

		if (__meta.ttl !== null) {
			setHeader("Cache-Control", `public, max-age=0, s-maxage=${__meta.ttl}`);
			setHeader("X-Cache", __meta.hit ? "HIT" : "MISS");
		}

		return data;
	});

export const getDailyUserCountFn = createServerFn({ method: "GET" })
	.middleware([isAdmin])
	.handler(async () => {
		const { data, __meta } = await getDailyUserCount();

		if (__meta.ttl !== null) {
			setHeader("Cache-Control", `public, max-age=0, s-maxage=${__meta.ttl}`);
			setHeader("X-Cache", __meta.hit ? "HIT" : "MISS");
		}

		return data;
	});
