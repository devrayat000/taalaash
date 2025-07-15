import { bookAuthor, chapter, subject } from "@/db/topic";
import db from "@/lib/db";
import { pineconeIndex } from "@/lib/pinecone";
import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { v4 as uuid } from "uuid";
import { object, string, array, number, instanceof as instanceof_ } from "zod";
import { put } from "@vercel/blob";

export const recognizeText = createServerFn({ method: "POST" })
	.validator(instanceof_(FormData))
	.handler(async ({ data: formData, signal }) => {
		try {
			const fetchUrl = new URL(
				"/v1/taalaash/bulk-upload",
				process.env.OCR_URL || "http://127.0.0.1:8001",
			);
			const response = await fetch(fetchUrl, {
				method: "POST",
				body: formData,
				signal,
			});
			const data = await response.json();
			return data.results as { text: string; file: string }[];
		} catch (error) {
			console.log("Error recognizing text:", error);
			throw new Error("Failed to recognize text");
		}
	});

export const indexDocuments = createServerFn({ method: "POST" })
	.validator(
		object({
			documents: array(string()),
			chapterId: string(),
		}),
	)
	.handler(async ({ data: { documents, chapterId } }) => {
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
		const docs = documents.map((text) => ({
			id: uuid(),
			text: text,
			...docInfo[0],
		}));
		await pineconeIndex.upsertRecords(docs);
		return docs;
	});

export const bulkUploadWithOCR = createServerFn({ method: "POST" })
	.validator(instanceof_(FormData))
	.handler(async ({ data: formData, signal }) => {
		try {
			// Extract chapter ID and files from FormData
			const chapterId = formData.get("chapterId") as string;
			const files = formData.getAll("files") as File[];

			if (!chapterId || !files.length) {
				throw new Error("Chapter ID and files are required");
			}

			console.log(
				`Starting bulk upload for chapter ${chapterId} with ${files.length} files`,
			);

			// Step 1: Upload files to get URLs
			console.log("Uploading files to blob storage...");
			const uploadPromises = files.map((file, index) =>
				put(`ocr/${chapterId}/${Date.now()}-${index}-${file.name}`, file, {
					access: "public",
					multipart: true,
				}),
			);

			const uploadedFiles = await Promise.all(uploadPromises);
			const fileUrls = uploadedFiles.map((f) => f.url);

			console.log(`Uploaded ${fileUrls.length} files successfully`);

			// Step 2: Call OCR bulk upload endpoint
			const ocrPayload = {
				chatper_id: chapterId, // Note: matches the typo in BulkProcessRequest
				file_urls: fileUrls,
			};

			const ocrUrl = new URL(
				"/v1/taalaash/bulk-upload",
				process.env.OCR_URL || "http://127.0.0.1:8001",
			);

			console.log("Sending files to OCR pipeline...");
			const ocrResponse = await fetch(ocrUrl, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(ocrPayload),
				signal,
			});

			if (!ocrResponse.ok) {
				const errorText = await ocrResponse.text();
				throw new Error(
					`OCR request failed: ${ocrResponse.status} ${errorText}`,
				);
			}

			const ocrResult = await ocrResponse.json();
			console.log("OCR pipeline started:", ocrResult);

			return {
				success: true,
				batch_id: ocrResult.batch_id,
				total: ocrResult.total,
				file_urls: fileUrls,
				message: `Started OCR processing for ${files.length} files. Batch ID: ${ocrResult.batch_id}`,
			};
		} catch (error) {
			console.error("Error in bulk upload with OCR:", error);
			throw new Error(
				error instanceof Error
					? `Bulk upload failed: ${error.message}`
					: "Bulk upload failed with unknown error",
			);
		}
	});
