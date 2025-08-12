import { createServerFn } from "@tanstack/react-start";
import { getStats } from "../service/get-stats";
import { isAdmin } from "@/server/middleware";

export const getStatsFn = createServerFn({ method: "GET" })
	.middleware([isAdmin])
	.handler(async () => {
		const data = await getStats();
		return data;
	});
