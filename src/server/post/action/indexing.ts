import { bookAuthor, chapter, subject } from "@/db/topic";
import db from "@/lib/db";
import { pineconeIndex } from "@/lib/pinecone";
import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { v4 as uuid } from "uuid";
import { object, string, array, number, instanceof as instanceof_ } from "zod";

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
