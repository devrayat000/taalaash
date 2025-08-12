import { createServerFn } from "@tanstack/react-start";
import {
	createChapter,
	createChapterSchema,
	updateChapter,
	updateChapterSchema,
} from "../service/create";
import { isAdmin } from "@/server/middleware";

export const createChapterFn = createServerFn({ method: "POST" })
	.middleware([isAdmin])
	.validator(createChapterSchema)
	.handler(async ({ data: params }) => {
		const data = await createChapter(params);
		return data;
	});

export const updateChapterFn = createServerFn({ method: "POST" })
	.middleware([isAdmin])
	.validator(updateChapterSchema)
	.handler(async ({ data: params }) => {
		const data = await updateChapter(params);
		return data;
	});
