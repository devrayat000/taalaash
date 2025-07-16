import { PutObjectCommand } from "@aws-sdk/client-s3";
import { instanceof as instanceof_ } from "zod";
import { v4 as uuid } from "uuid";
import { createServerFn } from "@tanstack/react-start";
import { s3BucketName, s3Client } from "@/lib/s3";

import { chapter, bookAuthor, subject } from "@/db/topic";
import db from "@/lib/db";

export const uploadPostImages = createServerFn({ method: "POST" })
	.validator(instanceof_(FormData).nullable())
	.handler(async ({ data }) => {
		try {
			const fileList = data?.getAll("files");
			if (!fileList || fileList.length === 0) {
				return [];
			}
			const files = Array.from(fileList || []);
			// Try to get chapterId and pages from FormData
			let chapterId: string | undefined;
			let pages: number[] = [];
			let chapterInfo: any = undefined;
			if (data?.has("chapterId")) {
				chapterId = data.get("chapterId") as string;
				// Fetch metadata once if chapterId exists
				const { eq } = await import("drizzle-orm");
				chapterInfo = await db
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
			}
			if (data?.has("pages")) {
				try {
					pages = JSON.parse(data.get("pages") as string);
				} catch {}
			}
			const fileUploadsPromise = files.map((file, idx) => {
				let meta: any = { chapterId, page: pages[idx] };
				if (chapterInfo?.[0]) {
					meta.chapterInfo = chapterInfo[0];
				}
				return uploadImage(file, meta);
			});
			const fileUploads = await Promise.all(fileUploadsPromise);
			return fileUploads;
		} catch (err) {
			console.log("Error: ", err);
		}
	});

async function uploadImage(
	file: FormDataEntryValue,
	meta?: { chapterId?: string; page?: number; chapterInfo?: any },
) {
	if (!(file instanceof File)) {
		return {
			error: "Invalid file type",
		};
	}

	let s3Path = "posts";
	if (meta?.chapterInfo) {
		const {
			subject: subjectName,
			book: bookName,
			edition,
			chapter: chapterName,
		} = meta.chapterInfo;
		const pageNo = meta.page ?? "unknown";
		const ext = file.name.split(".").pop() || "jpg";
		s3Path = `${subjectName}/${bookName}/${edition}/${chapterName}/page_${pageNo}.${ext}`;
	} else {
		s3Path = `posts/${uuid()}-${file.name}`;
	}

	const command = new PutObjectCommand({
		Bucket: s3BucketName,
		Key: s3Path,
		Body: new Uint8Array(await file.arrayBuffer()),
		ContentType: file.type,
		ACL: "public-read",
	});

	await s3Client.send(command);

	return {
		fileName: s3Path,
		fileUrl: `${process.env.S3_CDN_ENDPOINT}/${s3Path}`,
		contentType: file.type,
	};
}
