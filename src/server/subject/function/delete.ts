import { createServerFn } from "@tanstack/react-start";
import {
	deleteManySubjects,
	deleteManySubjectsSchema,
	deleteSubject,
	deleteSubjectSchema,
} from "../service/delete";

export const deleteSubjectFn = createServerFn({ method: "POST" })
	.validator(deleteSubjectSchema)
	.handler(async ({ data: { id } }) => {
		await deleteSubject({ id });
	});

export const deleteManySubjectsFn = createServerFn()
	.validator(deleteManySubjectsSchema)
	.handler(async ({ data: { ids } }) => {
		await deleteManySubjects({ ids });
	});
