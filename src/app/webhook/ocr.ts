import { createPost } from "@/server/post/action";
import { indexDocuments } from "@/server/post/action/indexing";
import { createServerFileRoute } from "@tanstack/react-start/server";
import { z } from "zod";

// Schema for validating webhook payload
const ocrResultSchema = z.object({
	id: z.string(),
	created_at: z.string(),
	updated_at: z.string(),
	file_url: z.string().url(),
	text: z.string(),
	metadata: z.object({
		chapterId: z.string(),
		page: z.number().optional(),
		keywords: z.array(z.string()).optional(),
		custom_data: z.record(z.string(), z.any()).optional(),
	}),
	error: z.string().optional(),
});

const webhookPayloadSchema = z.object({
	batch_id: z.string(),
	results: z.array(ocrResultSchema),
	timestamp: z.string(),
});

export const ServerRoute = createServerFileRoute("/webhook/ocr").methods({
	POST: async ({ request }) => {
		try {
			console.log("OCR webhook received");

			// Parse the request body
			const body = await request.json();
			console.log("Webhook payload:", JSON.stringify(body, null, 2));

			// Validate the payload
			const validatedData = webhookPayloadSchema.parse(body);
			const { batch_id, results, timestamp } = validatedData;

			console.log(
				`Processing batch ${batch_id} with ${results.length} results`,
			);

			// Filter out results with errors and extract successful OCR results
			const successfulResults = results.filter((result) => !result.error);
			const errorResults = results.filter((result) => result.error);

			if (errorResults.length > 0) {
				console.warn(
					`${errorResults.length} results had errors:`,
					errorResults.map((r) => r.error),
				);
			}

			if (successfulResults.length === 0) {
				console.log("No successful results to process");
				return new Response(
					JSON.stringify({
						success: true,
						message: "No successful results to process",
						processed: 0,
					}),
					{
						status: 200,
						headers: { "Content-Type": "application/json" },
					},
				);
			}

			// Group results by chapter for efficient processing
			const resultsByChapter = successfulResults.reduce(
				(acc, result) => {
					const chapterId = result.metadata.chapterId;
					if (!acc[chapterId]) {
						acc[chapterId] = [];
					}
					acc[chapterId].push(result);
					return acc;
				},
				{} as Record<string, typeof successfulResults>,
			);

			// Process each chapter's results
			const processedResults = [];

			for (const [chapterId, chapterResults] of Object.entries(
				resultsByChapter,
			)) {
				console.log(
					`Processing ${chapterResults.length} results for chapter ${chapterId}`,
				);

				try {
					// Prepare documents for indexing: only non-empty text
					const docsToIndex = chapterResults
						.map((r) => ({ id: r.id, text: r.text.trim() }))
						.filter((doc) => doc.text.length > 0);

					let indexedDocs = [];

					// Index documents if there's text to index
					if (docsToIndex.length > 0) {
						console.log(
							`Indexing ${docsToIndex.length} documents for chapter ${chapterId}`,
						);
						indexedDocs = await indexDocuments({
							data: {
								documents: docsToIndex,
								chapterId: chapterId,
							},
						});
						console.log(`Successfully indexed ${indexedDocs.length} documents`);
					}

					// Create posts in database
					// When creating posts, include all metadata fields
					const postsToCreate = chapterResults.map((result, index) => {
						const pageNumber = result.metadata.page || index + 1;
						console.log(
							`Mapping result ${result.id} to page ${pageNumber} for file ${result.file_url}`,
						);
						return {
							id: result.id,
							imageUrl: result.file_url,
							chapterId: chapterId,
							page: pageNumber,
							keywords: result.metadata.keywords || [],
							custom_data: result.metadata.custom_data || {},
						};
					});

					console.log(
						`Creating ${postsToCreate.length} posts for chapter ${chapterId}`,
					);
					const createdPosts = await createPost({ data: postsToCreate });
					console.log(`Successfully created ${createdPosts.length} posts`);

					processedResults.push({
						chapterId,
						processedCount: chapterResults.length,
						indexedCount: indexedDocs.length,
						createdPostsCount: createdPosts.length,
						errors: chapterResults.filter((r) => r.error).length,
					});
				} catch (error) {
					console.error(`Error processing chapter ${chapterId}:`, error);
					processedResults.push({
						chapterId,
						processedCount: 0,
						indexedCount: 0,
						createdPostsCount: 0,
						errors: chapterResults.length,
						error: error instanceof Error ? error.message : "Unknown error",
					});
				}
			}

			const totalProcessed = processedResults.reduce(
				(sum, r) => sum + r.processedCount,
				0,
			);
			const totalIndexed = processedResults.reduce(
				(sum, r) => sum + r.indexedCount,
				0,
			);
			const totalCreated = processedResults.reduce(
				(sum, r) => sum + r.createdPostsCount,
				0,
			);
			const totalErrors = processedResults.reduce(
				(sum, r) => sum + r.errors,
				0,
			);

			console.log(`Batch ${batch_id} processing complete:`, {
				totalProcessed,
				totalIndexed,
				totalCreated,
				totalErrors,
				batchSize: results.length,
			});

			// Return success response
			return new Response(
				JSON.stringify({
					success: true,
					batch_id,
					timestamp,
					summary: {
						totalResults: results.length,
						successfulResults: successfulResults.length,
						errorResults: errorResults.length,
						totalProcessed,
						totalIndexed,
						totalCreated,
						totalErrors,
					},
					details: processedResults,
				}),
				{
					status: 200,
					headers: { "Content-Type": "application/json" },
				},
			);
		} catch (error) {
			console.error("Error processing OCR webhook:", error);

			// Return error response
			return new Response(
				JSON.stringify({
					success: false,
					error: error instanceof Error ? error.message : "Unknown error",
					timestamp: new Date().toISOString(),
				}),
				{
					status: 500,
					headers: { "Content-Type": "application/json" },
				},
			);
		}
	},
});
