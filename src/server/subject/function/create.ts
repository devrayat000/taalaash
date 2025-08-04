import { createServerFn } from "@tanstack/react-start";
import { createSubject, createSubjectSchema } from "../service/create";

export const createSubjectFn = createServerFn({ method: "POST" })
	.validator(createSubjectSchema)
	.handler(async ({ data: params }) => {
		const data = await createSubject(params);
		return data;
	});
