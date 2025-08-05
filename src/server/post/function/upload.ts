import { createServerFn } from "@tanstack/react-start";
import { instanceof as instanceof_ } from "zod/mini";
import { uploadPostImages } from "../service/upload";

export const uploadPostImagesFn = createServerFn({ method: "POST" })
	.validator(instanceof_(FormData))
	.handler(async ({ data }) => {
		return await uploadPostImages(data);
	});
