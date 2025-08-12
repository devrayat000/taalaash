import { createServerFn } from "@tanstack/react-start";
import { setHeader } from "@tanstack/react-start/server";
import {
	getSubjectById,
	getSubjectByIdSchema,
	getSubjects,
	getSubjectsSchema,
} from "../service/get";
import { countSubjects } from "../service/count";

export const getSubjectsFn = createServerFn({ method: "GET" })
	.validator(getSubjectsSchema)
	.handler(async ({ data: params }) => {
		const [
			{ data: subjects, __meta: subjectMeta },
			{ data: count, __meta: countMeta },
		] = await Promise.all([
			getSubjects(params),
			countSubjects({ query: params?.query }),
		]);

		if (subjectMeta.ttl !== null && countMeta.ttl !== null) {
			setHeader(
				"Cache-Control",
				`public, max-age=0, s-maxage=${Math.min(subjectMeta.ttl, countMeta.ttl)}`,
			);
			setHeader("X-Cache", subjectMeta.hit && countMeta.hit ? "HIT" : "MISS");
		}

		return { data: subjects, count };
	});

export const getSubjectByIdFn = createServerFn({ method: "GET" })
	.validator(getSubjectByIdSchema)
	.handler(async ({ data: { id } }) => {
		const { data, __meta } = await getSubjectById({ id });

		if (__meta.ttl !== null) {
			setHeader("Cache-Control", `public, max-age=0, s-maxage=${__meta.ttl}`);
			setHeader("X-Cache", __meta.hit ? "HIT" : "MISS");
		}

		return data;
	});
