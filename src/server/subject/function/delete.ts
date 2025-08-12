import { createServerFn } from "@tanstack/react-start";
import {
	deleteManySubjects,
	deleteManySubjectsSchema,
	deleteSubject,
	deleteSubjectSchema,
} from "../service/delete";
import { isAdmin } from "@/server/middleware";

export const deleteSubjectFn = createServerFn({ method: "POST" })
	.middleware([isAdmin])
	.validator(deleteSubjectSchema)
	.handler(async ({ data: { id } }) => {
		await deleteSubject({ id });
	});

export const deleteManySubjectsFn = createServerFn()
	.middleware([isAdmin])
	.validator(deleteManySubjectsSchema)
	.handler(async ({ data: { ids } }) => {
		await deleteManySubjects({ ids });
	});
