import { createServerFn } from "@tanstack/react-start";
import { setHeader } from "@tanstack/react-start/server";
import {
	getBooks,
	getBooksSchema,
	getBookById,
	getBookByIdSchema,
	getFilteredBooks,
	getFilteredBooksSchema,
} from "../service/get";
import { countBooks } from "../service/count";

export const getBooksFn = createServerFn({ method: "GET" })
	.validator(getBooksSchema)
	.handler(async ({ data: params }) => {
		const [
			{ data: books, __meta: booksMeta },
			{ data: count, __meta: countMeta },
		] = await Promise.all([
			getBooks(params),
			countBooks({ query: params?.query }),
		]);

		if (booksMeta.ttl !== null && countMeta.ttl !== null) {
			setHeader(
				"Cache-Control",
				`public, max-age=0, s-maxage=${Math.min(booksMeta.ttl, countMeta.ttl)}`,
			);
			setHeader("X-Cache", booksMeta.hit && countMeta.hit ? "HIT" : "MISS");
		}

		return { data: books, count };
	});

export const getBookByIdFn = createServerFn({ method: "GET" })
	.validator(getBookByIdSchema)
	.handler(async ({ data: { id } }) => {
		const { data, __meta } = await getBookById({ id });

		if (__meta.ttl !== null) {
			setHeader("Cache-Control", `public, max-age=0, s-maxage=${__meta.ttl}`);
			setHeader("X-Cache", __meta.hit ? "HIT" : "MISS");
		}

		return data;
	});

export const getFilteredBooksFn = createServerFn({ method: "POST" })
	.validator(getFilteredBooksSchema)
	.handler(async ({ data: params }) => {
		const { data, __meta } = await getFilteredBooks(params);

		if (__meta.ttl !== null) {
			setHeader("Cache-Control", `public, max-age=0, s-maxage=${__meta.ttl}`);
			setHeader("X-Cache", __meta.hit ? "HIT" : "MISS");
		}

		return data;
	});
