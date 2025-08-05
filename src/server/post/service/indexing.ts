import { bookAuthor, chapter, subject } from "@/db/topic";
import db from "@/lib/db";
import { pineconeIndex } from "@/lib/pinecone";
import { eq } from "drizzle-orm";
import {
	object,
	string,
	array,
	instanceof as instanceof_,
	type infer as Infer,
} from "zod/mini";
import { invalidateTags } from "@/hooks/use-cache";
import {
	TransactionManager,
	createS3UploadStep,
	createOCRBatchWithS3RollbackStep,
} from "@/lib/transaction-manager";
import { uploadPostImages } from "./upload";
import {
	generateKey,
	exportKey,
	createSignature,
	generateKeyId,
} from "@/lib/webhook-crypto";

export const recognizeTextSchema = instanceof_(FormData);

export const recognizeTextFromFormData = async (
	formData: FormData,
	signal?: AbortSignal,
) => {
	const fetchUrl = new URL(
		"/v1/taalaash/bulk-upload",
		process.env.OCR_URL || "http://127.0.0.1:8001",
	);

	try {
		const response = await fetch(fetchUrl, {
			method: "POST",
			body: formData,
			signal,
		});

		if (!response.ok) {
			throw new Error(
				`OCR service error: ${response.status} ${response.statusText}`,
			);
		}

		const data = await response.json();
		return data.results as { text: string; file: string }[];
	} catch (error) {
		console.error("Error recognizing text:", error);
		throw new Error(
			`Failed to recognize text: ${error instanceof Error ? error.message : "Unknown error"}`,
		);
	}
};

export const indexDocumentsSchema = object({
	documents: array(
		object({
			id: string(),
			text: string(),
		}),
	),
	chapterId: string(),
});

export const indexDocuments = async ({
	documents,
	chapterId,
}: Infer<typeof indexDocumentsSchema>) => {
	const docInfo = await db
		.select({
			chapter: chapter.name,
			book: bookAuthor.name,
			subject: subject.name,
			edition: bookAuthor.edition,
		})
		.from(chapter)
		.innerJoin(bookAuthor, eq(chapter.bookAuthorId, bookAuthor.id))
		.innerJoin(subject, eq(bookAuthor.subjectId, subject.id))
		.where(eq(chapter.id, chapterId));

	if (!docInfo.length) {
		throw new Error(`Chapter not found: ${chapterId}`);
	}

	const {
		chapter: chapterName,
		book,
		subject: subjectName,
		edition,
	} = docInfo[0];

	// Create documents for indexing with proper metadata
	const docs = documents.map((doc) => ({
		id: doc.id,
		text: doc.text,
		chapter: chapterName,
		book,
		subject: subjectName,
		edition,
		chapterId,
	}));

	// Index in Pinecone (if configured)
	if (pineconeIndex) {
		try {
			await pineconeIndex.upsertRecords(docs);
			console.log(`Indexed ${docs.length} documents in Pinecone`);
		} catch (error) {
			console.error("Failed to index in Pinecone:", error);
			throw new Error(
				`Pinecone indexing failed: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
	}

	// Invalidate relevant caches
	await invalidateTags("posts", "posts:indexing");

	return {
		documents: docs,
		documentIds: documents.map((doc) => doc.id),
		count: docs.length,
	};
};

export const bulkUploadWithOCRSchema = instanceof_(FormData);

export const bulkUploadWithOCR = async (
	formData: FormData,
	signal?: AbortSignal,
) => {
	const transaction = new TransactionManager();

	try {
		const chapterId = formData.get("chapterId") as string;
		const files = formData.getAll("files") as File[];
		const pagesJson = formData.get("pages") as string;

		if (!chapterId || !files.length) {
			throw new Error("Chapter ID and files are required");
		}

		let pages: number[] = [];
		try {
			if (pagesJson) {
				pages = JSON.parse(pagesJson);
			}
		} catch (e) {
			console.warn("Failed to parse pages JSON:", e);
		}

		console.log(`Starting transaction for ${files.length} files upload...`);
		console.log(`Uploading files to S3...`);

		// Step 1: Upload to S3 with transaction tracking
		const s3Uploads = await uploadPostImages(formData);
		if (!s3Uploads || s3Uploads.length !== files.length) {
			throw new Error("S3 upload failed or file count mismatch");
		}

		// Add S3 upload rollback steps
		s3Uploads.forEach((upload, index) => {
			const s3Key = upload.fileName;
			const stepId = `s3-upload-${index}`;
			transaction.addStep(createS3UploadStep(stepId, s3Key));
			transaction.markCompleted(stepId);
		});

		console.log(`Uploaded ${s3Uploads.length} files to S3 successfully`);

		const images = s3Uploads.map((upload, index) => ({
			file_url: upload.publicUrl,
			metadata: {
				page: pages[index] || index + 1,
				keywords: [],
				custom_data: {
					originalFileName: files[index].name,
					fileSize: files[index].size,
					contentType: files[index].type,
					contentTypeS3: upload.contentType,
					uploadTimestamp: new Date().toISOString(),
				},
			},
		}));

		const ocrPayload = {
			chapter_id: chapterId,
			images: images,
		};

		// Create webhook verification key and prepare headers
		const webhookHeaders: Record<string, string> = {
			"Content-Type": "application/json",
		};

		// Add webhook verification data
		const webhookKey = process.env.WEBHOOK_VERIFICATION_KEY;
		const keyId = process.env.WEBHOOK_KEY_ID || "default";

		if (webhookKey) {
			try {
				// Generate signature for the OCR payload
				const payloadText = JSON.stringify(ocrPayload);
				const { importKey, createSignature, createSignatureHeader } =
					await import("@/lib/webhook-crypto");
				const key = await importKey(webhookKey);
				const signature = await createSignature(payloadText, key, keyId);
				const signatureHeader = createSignatureHeader(signature);

				webhookHeaders["X-Webhook-Signature"] = signatureHeader;
				console.log(
					`Added webhook signature to OCR request with key: ${keyId}`,
				);
			} catch (sigError) {
				console.error("Failed to create webhook signature:", sigError);
				// Continue without signature for development
			}
		} else {
			console.warn(
				"No WEBHOOK_VERIFICATION_KEY configured, sending unsigned OCR request",
			);
		}

		const ocrUrl = new URL(
			"/v1/taalaash/bulk-upload",
			process.env.OCR_URL || "http://127.0.0.1:8001",
		);

		console.log("Sending files to OCR pipeline with metadata and signature...");
		const ocrResponse = await fetch(ocrUrl, {
			method: "POST",
			headers: webhookHeaders,
			body: JSON.stringify(ocrPayload),
			signal,
		});

		if (!ocrResponse.ok) {
			const errorText = await ocrResponse.text();
			throw new Error(`OCR request failed: ${ocrResponse.status} ${errorText}`);
		}

		const ocrResult = await ocrResponse.json();
		console.log("OCR pipeline started:", ocrResult);

		// Add OCR batch rollback step with S3 cleanup capability
		const s3Keys = s3Uploads.map((upload) => upload.fileName);
		const ocrBatchStepId = `ocr-batch-${ocrResult.batch_id}`;
		transaction.addStep(
			createOCRBatchWithS3RollbackStep(
				ocrBatchStepId,
				ocrResult.batch_id,
				s3Keys,
			),
		);
		transaction.markCompleted(ocrBatchStepId);

		// If we reach here, everything succeeded
		console.log(
			"Transaction completed successfully. Cleaning up transaction manager.",
		);
		transaction.cleanup();

		return {
			success: true,
			batch_id: ocrResult.batch_id,
			total: ocrResult.total,
			images: images,
			message: `Started OCR processing for ${files.length} files with page metadata. Batch ID: ${ocrResult.batch_id}`,
			transaction_summary: transaction.getSummary(),
		};
	} catch (error) {
		console.error("Error in bulk upload with OCR:", error);

		// Rollback all completed steps
		try {
			await transaction.rollback(
				error instanceof Error ? error.message : "Unknown error",
			);
		} catch (rollbackError) {
			console.error("Rollback failed:", rollbackError);
		}

		throw new Error(
			error instanceof Error
				? `Bulk upload failed: ${error.message}`
				: "Bulk upload failed with unknown error",
		);
	}
};
