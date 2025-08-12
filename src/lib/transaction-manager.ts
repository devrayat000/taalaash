import { s3Client, s3BucketName } from "@/lib/s3";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { denseIndex, sparseIndex } from "@/lib/pinecone";
import db from "@/lib/db";
import { eq, inArray } from "drizzle-orm";
import { post } from "@/db/topic";

export interface TransactionStep {
	id: string;
	type: "s3" | "database" | "pinecone" | "ocr";
	data: any;
	rollback: () => Promise<void>;
}

export class TransactionManager {
	private steps: TransactionStep[] = [];
	private completed: string[] = [];

	/**
	 * Add a step to the transaction
	 */
	addStep(step: TransactionStep) {
		this.steps.push(step);
	}

	/**
	 * Mark a step as completed
	 */
	markCompleted(stepId: string) {
		if (!this.completed.includes(stepId)) {
			this.completed.push(stepId);
		}
	}

	/**
	 * Rollback all completed steps in reverse order
	 */
	async rollback(reason?: string) {
		console.log(`Starting rollback process. Reason: ${reason || "Unknown"}`);
		console.log(`Rolling back ${this.completed.length} completed steps`);

		const errors: string[] = [];

		// Rollback in reverse order
		for (const stepId of this.completed.reverse()) {
			const step = this.steps.find((s) => s.id === stepId);
			if (step) {
				try {
					console.log(`Rolling back step: ${step.id} (${step.type})`);
					await step.rollback();
					console.log(`Successfully rolled back step: ${step.id}`);
				} catch (error) {
					const errorMsg = `Failed to rollback step ${step.id}: ${error instanceof Error ? error.message : "Unknown error"}`;
					console.error(errorMsg);
					errors.push(errorMsg);
				}
			}
		}

		if (errors.length > 0) {
			console.error(`Rollback completed with ${errors.length} errors:`, errors);
			throw new Error(`Rollback partially failed: ${errors.join("; ")}`);
		}

		console.log("Rollback completed successfully");
		this.cleanup();
	}

	/**
	 * Clear all steps and completed markers
	 */
	cleanup() {
		this.steps = [];
		this.completed = [];
	}

	/**
	 * Get rollback summary
	 */
	getSummary() {
		return {
			totalSteps: this.steps.length,
			completedSteps: this.completed.length,
			pendingSteps: this.steps.length - this.completed.length,
		};
	}
}

/**
 * S3 Upload Transaction Step
 */
export function createS3UploadStep(
	stepId: string,
	s3Key: string,
): TransactionStep {
	return {
		id: stepId,
		type: "s3",
		data: { s3Key },
		rollback: async () => {
			try {
				const deleteCommand = new DeleteObjectCommand({
					Bucket: s3BucketName,
					Key: s3Key,
				});
				await s3Client.send(deleteCommand);
				console.log(`Deleted S3 object: ${s3Key}`);
			} catch (error) {
				// If file doesn't exist, that's fine for rollback
				if (error instanceof Error && error.name === "NoSuchKey") {
					console.log(`S3 object ${s3Key} already deleted or doesn't exist`);
				} else {
					throw error;
				}
			}
		},
	};
}

/**
 * Database Insert Transaction Step
 */
export function createDatabaseInsertStep(
	stepId: string,
	postIds: string[],
): TransactionStep {
	return {
		id: stepId,
		type: "database",
		data: { postIds },
		rollback: async () => {
			if (postIds.length > 0) {
				await db.delete(post).where(inArray(post.id, postIds));
				console.log(`Deleted ${postIds.length} posts from database`);
			}
		},
	};
}

/**
 * Pinecone Index Transaction Step
 */
export function createPineconeIndexStep(
	stepId: string,
	documentIds: string[],
): TransactionStep {
	return {
		id: stepId,
		type: "pinecone",
		data: { documentIds },
		rollback: async () => {
			if (documentIds.length > 0) {
				await denseIndex.deleteMany(documentIds);
				await sparseIndex.deleteMany(documentIds);
				console.log(`Deleted ${documentIds.length} documents from Pinecone`);
			}
		},
	};
}

/**
 * OCR Batch Transaction Step (for cleanup)
 */
export function createOCRBatchStep(
	stepId: string,
	batchId: string,
	redisClient?: any,
): TransactionStep {
	return {
		id: stepId,
		type: "ocr",
		data: { batchId },
		rollback: async () => {
			// Clean up Redis keys related to the batch
			if (redisClient) {
				try {
					await redisClient.delete(`batch:${batchId}:results`);
					await redisClient.delete(`batch:${batchId}:completed`);
					await redisClient.delete(`batch:${batchId}:total`);
					console.log(`Cleaned up OCR batch Redis keys for batch: ${batchId}`);
				} catch (error) {
					console.warn(`Failed to clean up OCR batch keys: ${error}`);
				}
			}
		},
	};
}

/**
 * Create a comprehensive OCR batch step that can rollback S3 uploads on failure
 */
export function createOCRBatchWithS3RollbackStep(
	stepId: string,
	batchId: string,
	s3Keys: string[],
): TransactionStep {
	return {
		id: stepId,
		type: "ocr",
		data: { batchId, s3Keys },
		rollback: async () => {
			console.log(
				`Rolling back OCR batch ${batchId} with ${s3Keys.length} S3 objects`,
			);

			const errors: string[] = [];

			// Rollback S3 uploads
			for (const s3Key of s3Keys) {
				try {
					const deleteCommand = new DeleteObjectCommand({
						Bucket: s3BucketName,
						Key: s3Key,
					});
					await s3Client.send(deleteCommand);
					console.log(`Deleted S3 object during OCR batch rollback: ${s3Key}`);
				} catch (error) {
					const errorMsg = `Failed to delete S3 object ${s3Key} during OCR batch rollback: ${error}`;
					console.error(errorMsg);
					errors.push(errorMsg);
				}
			}

			if (errors.length > 0) {
				throw new Error(
					`OCR batch rollback partially failed: ${errors.join(", ")}`,
				);
			}

			console.log(`Successfully rolled back OCR batch ${batchId}`);
		},
	};
}
