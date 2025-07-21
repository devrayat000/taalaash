// import { authed } from "@/server/middleware";
import { createServerFn } from "@tanstack/react-start";
import { object, optional, string, url } from "zod/v4-mini";

export const requestHighlight = createServerFn({ method: "POST" })
	// .middleware([authed])
	.validator(
		object({
			fileUrl: url(),
			searchText: string(),
			metadata: optional(
				object({
					book: string(),
					chapter: string(),
				}),
			),
		}),
	)
	.handler(async ({ data, signal }) => {
		const response = await fetch(
			`${process.env.OCR_URL}/v1/taalaash/highlight`,
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(data),
				signal,
			},
		);

		if (!response.ok) {
			throw new Error("Failed to fetch highlights");
		}

		return response.json() as Promise<{ taskId: string }>;
	});

export const consumeHighlight = createServerFn({
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
