import { PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuid } from "uuid";
import { instanceof as instanceof_ } from "zod/mini";
import { s3BucketName, s3Client } from "@/lib/s3";
import { chapter, bookAuthor, subject } from "@/db/topic";
import db from "@/lib/db";
import { eq } from "drizzle-orm";

export const uploadImageSchema = instanceof_(FormData);

type ChapterInfo = {
	chapter: string;
	book: string;
	subject: string;
	edition: string;
};

type UploadMeta = {
	chapterId?: string;
	page?: number;
	chapterInfo?: ChapterInfo;
};

export async function uploadImage(file: FormDataEntryValue, meta?: UploadMeta) {
	const validatedFile = file as File;
	const fileName = `${uuid()}-${validatedFile.name}`;
	const fileBuffer = await validatedFile.arrayBuffer();

	const uploadParams = {
		Bucket: s3BucketName,
		Key: fileName,
		Body: new Uint8Array(fileBuffer),
		ContentType: validatedFile.type,
		Metadata: {
			originalName: validatedFile.name,
			...(meta && { metaData: JSON.stringify(meta) }),
		},
	};

	try {
		const command = new PutObjectCommand(uploadParams);
		const response = await s3Client.send(command);

		const publicUrl = `https://${s3BucketName}.s3.amazonaws.com/${fileName}`;

		return {
			success: true,
			fileName,
			publicUrl,
			size: validatedFile.size,
			contentType: validatedFile.type,
			eTag: response.ETag,
			versionId: response.VersionId,
			meta,
		};
	} catch (error) {
		console.error("S3 upload error:", error);
		throw new Error(
			`Failed to upload file: ${error instanceof Error ? error.message : "Unknown error"}`,
		);
	}
}

export async function getChapterInfo(chapterId: string) {
	try {
		return await db
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
	} catch (error) {
		console.error("Error fetching chapter info:", error);
		throw new Error(
			`Failed to fetch chapter info: ${error instanceof Error ? error.message : "Unknown error"}`,
		);
	}
}

export async function uploadPostImages(formData: FormData) {
	try {
		const fileList = formData.getAll("files");
		if (!fileList || fileList.length === 0) {
			return [];
		}
		const files = Array.from(fileList || []);

		// Try to get chapterId and pages from FormData
		let chapterId: string | undefined;
		let pages: number[] = [];
		let chapterInfo: ChapterInfo[] | undefined = undefined;

		if (formData.has("chapterId")) {
			chapterId = formData.get("chapterId") as string;
			// Fetch metadata once if chapterId exists
			const info = await getChapterInfo(chapterId);
			chapterInfo = info;
		}

		if (formData.has("pages")) {
			try {
				pages = JSON.parse(formData.get("pages") as string);
			} catch (e) {
				console.warn("Failed to parse pages:", e);
			}
		}

		const fileUploadsPromise = files.map((file, idx) => {
			const meta: UploadMeta = {
				chapterId,
				page: pages[idx],
				chapterInfo: chapterInfo?.[0],
			};
			return uploadImage(file, meta);
		});

		const fileUploads = await Promise.all(fileUploadsPromise);
		return fileUploads;
	} catch (error) {
		console.error("Error uploading post images:", error);
		throw new Error(
			`Failed to upload post images: ${error instanceof Error ? error.message : "Unknown error"}`,
		);
	}
}
