import { createServerFn } from "@tanstack/react-start";
import { requestHighlight, requestHighlightSchema } from "../service/highlight";

export const requestHighlightFn = createServerFn({ method: "POST" })
	.validator(requestHighlightSchema)
	.handler(async ({ data, signal }) => {
		const result = await requestHighlight(data, signal);
		return result;
	});
