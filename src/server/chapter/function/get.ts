import { createServerFn } from "@tanstack/react-start";
import { setHeader } from "@tanstack/react-start/server";
import {
	getChapters,
	getChaptersSchema,
	getChapterById,
	getChapterByIdSchema,
	getChaptersByBook,
	getChaptersByBookSchema,
} from "../service/get";
import { countChapters } from "../service/count";
import { isAdmin } from "@/server/middleware";

export const getChaptersFn = createServerFn({ method: "GET" })
	.middleware([isAdmin])
	.validator(getChaptersSchema)
	.handler(async ({ data: params }) => {
		const [
			{ data: chapters, __meta: chaptersMeta },
			{ data: count, __meta: countMeta },
		] = await Promise.all([
			getChapters(params),
			countChapters({ query: params?.query }),
		]);

		if (chaptersMeta.ttl !== null && countMeta.ttl !== null) {
			setHeader(
				"Cache-Control",
				`public, max-age=0, s-maxage=${Math.min(chaptersMeta.ttl, countMeta.ttl)}`,
			);
			setHeader("X-Cache", chaptersMeta.hit && countMeta.hit ? "HIT" : "MISS");
		}

		return { data: chapters, count };
	});

export const getChapterByIdFn = createServerFn({ method: "GET" })
	.middleware([isAdmin])
	.validator(getChapterByIdSchema)
	.handler(async ({ data: { id } }) => {
		const { data, __meta } = await getChapterById({ id });

		if (__meta.ttl !== null) {
			setHeader("Cache-Control", `public, max-age=0, s-maxage=${__meta.ttl}`);
			setHeader("X-Cache", __meta.hit ? "HIT" : "MISS");
		}

		return data;
	});

export const getChaptersByBookFn = createServerFn({ method: "GET" })
	.middleware([isAdmin])
	.validator(getChaptersByBookSchema)
	.handler(async ({ data: { bookAuthorId } }) => {
		const { data, __meta } = await getChaptersByBook({ bookAuthorId });

		if (__meta.ttl !== null) {
			setHeader("Cache-Control", `public, max-age=0, s-maxage=${__meta.ttl}`);
			setHeader("X-Cache", __meta.hit ? "HIT" : "MISS");
		}

		return data;
	});
