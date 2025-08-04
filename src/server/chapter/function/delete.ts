import { createServerFn } from "@tanstack/react-start";
import {
	deleteChapter,
	deleteChapterSchema,
	deleteManyChapters,
	deleteManyChaptersSchema,
} from "../service/delete";
import { isAdmin } from "@/server/middleware";

export const deleteChapterFn = createServerFn({ method: "POST" })
	.middleware([isAdmin])
	.validator(deleteChapterSchema)
	.handler(async ({ data: params }) => {
		const data = await deleteChapter(params);
		return data;
	});

export const deleteManyChaptersFn = createServerFn({ method: "POST" })
	.middleware([isAdmin])
	.validator(deleteManyChaptersSchema)
	.handler(async ({ data: params }) => {
		const data = await deleteManyChapters(params);
		return data;
	});
