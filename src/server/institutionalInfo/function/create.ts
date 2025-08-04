import { createServerFn } from "@tanstack/react-start";
import {
	saveInstitutionalInfo,
	saveInstitutionalInfoSchema,
} from "../service/create";
import { authed } from "@/server/middleware";

export const saveInstitutionalInfoFn = createServerFn({ method: "POST" })
	.middleware([authed])
	.validator(saveInstitutionalInfoSchema)
	.handler(async ({ data: params, context }) => {
		await saveInstitutionalInfo({ ...params, userId: context.user.id });
	});
