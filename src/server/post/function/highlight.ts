import { createServerFn } from "@tanstack/react-start";
import { requestHighlight, requestHighlightSchema } from "../service/highlight";
import { object, string } from "zod/mini";

export const requestHighlightFn = createServerFn({ method: "POST" })
	.validator(requestHighlightSchema)
	.handler(async ({ data, signal }) => {
		const result = await requestHighlight(data, signal);
		return result;
	});

export const consumeHighlightFn = createServerFn({
	method: "GET",
	response: "raw",
})
	.validator(
		object({
			taskId: string(),
		}),
	)
	// .middleware([authed])
	.handler(async ({ data, signal }) => {
		const response = await fetch(
			`${process.env.OCR_URL}/v1/taalaash/highlight?task_id=${data.taskId}`,
			{
				method: "GET",
				signal,
			},
		);
		return response;
	});
