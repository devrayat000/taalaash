import { createServerFn } from "@tanstack/react-start";
import { updateSubject, updateSubjectSchema } from "../service/update";
import { isAdmin } from "@/server/middleware";

export const updateSubjectFn = createServerFn({ method: "POST" })
	.middleware([isAdmin])
	.validator(updateSubjectSchema)
	.handler(async ({ data: params }) => {
		const data = await updateSubject(params);
		return data;
	});
