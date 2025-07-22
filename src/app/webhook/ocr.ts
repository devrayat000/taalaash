import { createPost } from "@/server/post/action";
import { indexDocuments } from "@/server/post/action/indexing";
import { createServerFileRoute } from "@tanstack/react-start/server";
import {
	object,
	string,
	url,
	prettifyError,
	array,
	number,
	record,
	any,
	optional,
} from "zod/v4-mini";
import {
	TransactionManager,
	createDatabaseInsertStep,
	createPineconeIndexStep,
	createOCRBatchWithS3RollbackStep,
} from "@/lib/transaction-manager";

// Schema for validating webhook payload with custom error messages
const ocrResultSchema = object(
	{
		id: string(),
		created_at: string(),
		updated_at: string(),
		file_url: url(),
		text: string(),
		metadata: object(
			{
				chapterId: string(),
				page: optional(number()),
				keywords: optional(array(string())),
				custom_data: optional(record(string(), any())),
			},
			"OCR result metadata validation failed",
		),
		error: optional(string()),
	},
	"OCR result schema validation failed",
);

const webhookPayloadSchema = object(
	{
		batch_id: string(),
		results: array(ocrResultSchema),
		timestamp: string(),
	},
	"Webhook payload validation failed",
);

export const ServerRoute = createServerFileRoute("/webhook/ocr").methods({
	POST: async ({ request }) => {
		const requestStartTime = Date.now();
		const requestId = `ocr-webhook-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

		try {
			console.log(
				`[${requestId}] 🎯 OCR webhook received at ${new Date().toISOString()}`,
			);

			// Parse the request body
			let body: unknown;
			try {
				body = await request.json();
				console.log(
					`[${requestId}] 📥 Request body parsed successfully. Size: ${JSON.stringify(body).length} chars`,
				);
			} catch (parseError) {
				console.error(
					`[${requestId}] ❌ Failed to parse request body:`,
					parseError,
				);
				return new Response(
					JSON.stringify({
						success: false,
						error: "Invalid JSON in request body",
						requestId,
						timestamp: new Date().toISOString(),
					}),
					{
						status: 400,
						headers: { "Content-Type": "application/json" },
					},
				);
			}

			// Validate the payload with detailed error logging using safeParse
			const validationResult = webhookPayloadSchema.safeParse(body);
			if (!validationResult.success) {
				const prettyError = prettifyError(validationResult.error);
				console.error(`[${requestId}] ❌ Payload validation failed:`, {
					error: prettyError,
					receivedPayload: body,
					validationDetails: validationResult.error.issues.map((err) => ({
						path: err.path.join("."),
						message: err.message,
						code: err.code,
						received: "received" in err ? err.received : undefined,
					})),
				});

				return new Response(
					JSON.stringify({
						success: false,
						error: "Payload validation failed",
						prettyError,
						validationErrors: validationResult.error.issues.map((err) => ({
							field: err.path.join("."),
							message: err.message,
							receivedValue: "received" in err ? err.received : undefined,
						})),
						requestId,
						timestamp: new Date().toISOString(),
					}),
					{
						status: 400,
						headers: { "Content-Type": "application/json" },
					},
				);
			}

			const validatedData = validationResult.data;
			console.log(`[${requestId}] ✅ Payload validation successful`);

			const { batch_id, results, timestamp } = validatedData;

			console.log(
				`[${requestId}] 🔄 Processing batch ${batch_id} with ${results.length} results (received at ${timestamp})`,
			);

			// Filter out results with errors and extract successful OCR results
			const successfulResults = results.filter((result) => !result.error);
			const errorResults = results.filter((result) => result.error);

			console.log(`[${requestId}] 📊 Batch ${batch_id} analysis:`, {
				totalResults: results.length,
				successfulResults: successfulResults.length,
				errorResults: errorResults.length,
				batchTimestamp: timestamp,
			});

			if (errorResults.length > 0) {
				console.warn(
					`[${requestId}] ⚠️ ${errorResults.length} results had errors:`,
					errorResults.map((r, idx) => ({
						index: idx,
						fileUrl: r.file_url,
						error: r.error,
						chapterId: r.metadata?.chapterId,
						page: r.metadata?.page,
					})),
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
						`[${requestId}] ✅ Successfully completed emergency rollback for batch ${batch_id}:`,
						{
							rolledBackObjects: s3Keys.length,
							processingTime: `${Date.now() - requestStartTime}ms`,
						},
					);

					// Return failure response indicating rollback was performed
					return new Response(
						JSON.stringify({
							success: false,
							batch_id,
							requestId,
							message: `Batch failed with ${(failureRate * 100).toFixed(1)}% failure rate. Rollback completed.`,
							processed: 0,
							batch_failure_rate: failureRate,
							rollback_completed: true,
							rolled_back_objects: s3Keys.length,
							processing_time_ms: Date.now() - requestStartTime,
							timestamp: new Date().toISOString(),
						}),
						{
							status: 200, // 200 because webhook was processed successfully
							headers: { "Content-Type": "application/json" },
						},
					);
				} catch (rollbackError) {
					console.error(
						`[${requestId}] ❌ Failed to rollback batch ${batch_id}:`,
						{
							error: rollbackError,
							stack:
								rollbackError instanceof Error
									? rollbackError.stack
									: undefined,
							batchId: batch_id,
							s3KeysRequiringManualCleanup: s3Keys,
							processingTime: `${Date.now() - requestStartTime}ms`,
						},
					);

					// Return error response indicating rollback failed
					return new Response(
						JSON.stringify({
							success: false,
							batch_id,
							requestId,
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
							processing_time_ms: Date.now() - requestStartTime,
							timestamp: new Date().toISOString(),
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

			const { totalProcessed, totalIndexed, totalCreated, totalErrors } =
				processedResults.reduce(
					(acc, r) => ({
						totalProcessed: acc.totalProcessed + r.processedCount,
						totalIndexed: acc.totalIndexed + r.indexedCount,
						totalCreated: acc.totalCreated + r.createdPostsCount,
						totalErrors: acc.totalErrors + r.errors,
					}),
					{
						totalProcessed: 0,
						totalIndexed: 0,
						totalCreated: 0,
						totalErrors: 0,
					},
				);

			console.log(`[${requestId}] 📊 Batch ${batch_id} processing complete:`, {
				totalProcessed,
				totalIndexed,
				totalCreated,
				totalErrors: totalErrors + errorResults.length,
				batchSize: results.length,
				batchFailureRate: failureRate,
				processingTime: `${Date.now() - requestStartTime}ms`,
			});

			// Return success response
			return new Response(
				JSON.stringify({
					success: true,
					batch_id,
					requestId,
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
					processing_time_ms: Date.now() - requestStartTime,
				}),
				{
					status: 200,
					headers: { "Content-Type": "application/json" },
				},
			);
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : String(error);
			console.error(`[${requestId}] ❌ OCR webhook processing failed:`, {
				requestId,
				batch_id: webhookData?.batch_id || "unknown",
				timestamp,
				error: errorMessage,
				stack: error instanceof Error ? error.stack : undefined,
				processingTime: `${Date.now() - requestStartTime}ms`,
			});

			return new Response(
				JSON.stringify({
					success: false,
					error: "Internal server error during OCR processing",
					requestId,
					timestamp,
					processing_time_ms: Date.now() - requestStartTime,
				}),
				{
					status: 500,
					headers: { "Content-Type": "application/json" },
				},
			);
		}
	},
});
