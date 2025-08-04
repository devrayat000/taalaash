import { createServerFn } from "@tanstack/react-start";
import { updateSubject, updateSubjectSchema } from "../service/update";

export const updateSubjectFn = createServerFn({ method: "POST" })
	.validator(updateSubjectSchema)
	.handler(async ({ data: params }) => {
		const data = await updateSubject(params);
		return data;
	});
