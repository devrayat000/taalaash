import { createServerFn } from "@tanstack/react-start";
import { createSubject, createSubjectSchema } from "../service/create";
import { isAdmin } from "@/server/middleware";

export const createSubjectFn = createServerFn({ method: "POST" })
	.middleware([isAdmin])
	.validator(createSubjectSchema)
	.handler(async ({ data: params }) => {
		const data = await createSubject(params);
		return data;
	});
