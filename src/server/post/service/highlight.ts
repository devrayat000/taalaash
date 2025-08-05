import { object, optional, string, url, type infer as Infer } from "zod/mini";

export const requestHighlightSchema = object({
	fileUrl: url(),
	searchText: string(),
	metadata: optional(
		object({
			book: string(),
			chapter: string(),
		}),
	),
});

export const requestHighlight = async (
	data: Infer<typeof requestHighlightSchema>,
	signal?: AbortSignal,
) => {
	try {
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
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		return response.json();
	} catch (error) {
		console.error("Error requesting highlight:", error);
		throw new Error(
			`Failed to request highlight: ${error instanceof Error ? error.message : "Unknown error"}`,
		);
	}
};
