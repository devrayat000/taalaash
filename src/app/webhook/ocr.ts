import { createPost } from "@/server/post/action";
import { indexDocuments } from "@/server/post/action/indexing";
import { createServerFileRoute } from "@tanstack/react-start/server";
import { z } from "zod";
import {
	TransactionManager,
	createDatabaseInsertStep,
	createPineconeIndexStep,
	createOCRBatchWithS3RollbackStep,
} from "@/lib/transaction-manager";

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

			// Calculate failure rate
			const failureRate = errorResults.length / results.length;
			const FAILURE_THRESHOLD = 0.5; // 50% failure threshold

			// If failure rate is too high, trigger immediate rollback
			if (failureRate > FAILURE_THRESHOLD) {
				console.error(
					`🚨 CRITICAL FAILURE: Batch ${batch_id} has high failure rate: ${(failureRate * 100).toFixed(1)}% (${errorResults.length}/${results.length} failed)`,
				);

				// Extract S3 keys from all results for rollback
				const s3Keys = results.map((result) => {
					// Extract S3 key from file URL
					const url = new URL(result.file_url);
					return url.pathname.substring(1); // Remove leading slash
				});

				console.error(
					`Triggering immediate rollback for batch ${batch_id} with ${s3Keys.length} S3 objects`,
				);

				// Create rollback transaction
				const rollbackTransaction = new TransactionManager();
				const rollbackStepId = `emergency-rollback-${batch_id}`;

				try {
					rollbackTransaction.addStep(
						createOCRBatchWithS3RollbackStep(rollbackStepId, batch_id, s3Keys),
					);
					rollbackTransaction.markCompleted(rollbackStepId);

					await rollbackTransaction.rollback(
						`Emergency rollback for failed OCR batch ${batch_id} (${(failureRate * 100).toFixed(1)}% failure rate)`,
					);

					console.log(
						`✅ Successfully completed emergency rollback for batch ${batch_id}`,
					);

					// Return failure response indicating rollback was performed
					return new Response(
						JSON.stringify({
							success: false,
							batch_id,
							message: `Batch failed with ${(failureRate * 100).toFixed(1)}% failure rate. Rollback completed.`,
							processed: 0,
							batch_failure_rate: failureRate,
							rollback_completed: true,
							rolled_back_objects: s3Keys.length,
						}),
						{
							status: 200, // 200 because webhook was processed successfully
							headers: { "Content-Type": "application/json" },
						},
					);
				} catch (rollbackError) {
					console.error(
						`❌ Failed to rollback batch ${batch_id}:`,
						rollbackError,
					);

					// Return error response indicating rollback failed
					return new Response(
						JSON.stringify({
							success: false,
							batch_id,
							message: `Batch failed with ${(failureRate * 100).toFixed(1)}% failure rate. Rollback FAILED.`,
							processed: 0,
							batch_failure_rate: failureRate,
							rollback_attempted: true,
							rollback_failed: true,
							rollback_error:
								rollbackError instanceof Error
									? rollbackError.message
									: "Unknown rollback error",
							s3_keys_requiring_manual_cleanup: s3Keys,
						}),
						{
							status: 500,
							headers: { "Content-Type": "application/json" },
						},
					);
				}
			}

			if (successfulResults.length === 0) {
				console.log("No successful results to process");
				return new Response(
					JSON.stringify({
						success: successfulResults.length > 0,
						batch_id,
						message: "No successful results to process",
						processed: 0,
						batch_failure_rate: failureRate,
						requires_rollback: failureRate > FAILURE_THRESHOLD,
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

				const transaction = new TransactionManager();

				try {
					// Prepare documents for indexing: only non-empty text
					const docsToIndex = chapterResults
						.map((r) => ({ id: r.id, text: r.text.trim() }))
						.filter((doc) => doc.text.length > 0);

					let indexedResult = { documents: [], documentIds: [], count: 0 };
					const documentIds: string[] = [];

					// Step 1: Index documents if there's text to index
					if (docsToIndex.length > 0) {
						console.log(
							`Indexing ${docsToIndex.length} documents for chapter ${chapterId}`,
						);
						indexedResult = await indexDocuments({
							data: {
								documents: docsToIndex,
								chapterId: chapterId,
							},
						});

						// Track Pinecone indexing for rollback
						documentIds.push(...indexedResult.documentIds);
						const pineconeStepId = `pinecone-index-${chapterId}`;
						transaction.addStep(
							createPineconeIndexStep(pineconeStepId, documentIds),
						);
						transaction.markCompleted(pineconeStepId);

						console.log(
							`Successfully indexed ${indexedResult.count} documents`,
						);
					}

					// Step 2: Create posts in database
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

					// Track database inserts for rollback
					const postIds = postsToCreate.map((post) => post.id);
					const dbStepId = `database-insert-${chapterId}`;
					transaction.addStep(createDatabaseInsertStep(dbStepId, postIds));
					transaction.markCompleted(dbStepId);

					console.log(`Successfully created ${createdPosts.length} posts`);

					// If we reach here, chapter processing succeeded
					console.log(`Chapter ${chapterId} processing completed successfully`);
					transaction.cleanup();

					processedResults.push({
						chapterId,
						processedCount: chapterResults.length,
						indexedCount: indexedResult.count,
						createdPostsCount: createdPosts.length,
						errors: 0,
						transaction_summary: transaction.getSummary(),
					});
				} catch (error) {
					console.error(`Error processing chapter ${chapterId}:`, error);

					// Rollback chapter-specific changes
					try {
						await transaction.rollback(
							`Chapter ${chapterId} processing failed: ${error instanceof Error ? error.message : "Unknown error"}`,
						);
						console.log(
							`Successfully rolled back changes for chapter ${chapterId}`,
						);
					} catch (rollbackError) {
						console.error(
							`Rollback failed for chapter ${chapterId}:`,
							rollbackError,
						);
					}

					processedResults.push({
						chapterId,
						processedCount: 0,
						indexedCount: 0,
						createdPostsCount: 0,
						errors: chapterResults.length,
						error: error instanceof Error ? error.message : "Unknown error",
						rollback_attempted: true,
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
				totalErrors: totalErrors + errorResults.length,
				batchSize: results.length,
				batchFailureRate: failureRate,
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
						totalErrors: totalErrors + errorResults.length,
						batchFailureRate: failureRate,
						requiresRollback: failureRate > FAILURE_THRESHOLD,
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
