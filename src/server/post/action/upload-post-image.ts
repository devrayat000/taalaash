import { PutObjectCommand } from "@aws-sdk/client-s3";
import { instanceof as instanceof_ } from "zod";
import { v4 as uuid } from "uuid";
import { createServerFn } from "@tanstack/react-start";
import { s3BucketName, s3Client } from "@/lib/s3";

async function uploadImage(file: FormDataEntryValue) {
	if (!(file instanceof File)) {
		return {
			error: "Invalid file type",
		};
	}

	const customFileName = `${uuid()}-${file.name}`;
	const command = new PutObjectCommand({
		Bucket: s3BucketName,
		Key: `posts/${customFileName}`,
		Body: new Uint8Array(await file.arrayBuffer()),
		ContentType: file.type,
		ACL: "public-read",
	});

	await s3Client.send(command);

	return {
		fileName: customFileName,
		fileUrl: `${process.env.S3_CDN_ENDPOINT}/posts/${customFileName}`,
		contentType: file.type,
	};
}

export const uploadPostImages = createServerFn({ method: "POST" })
	.validator(instanceof_(FormData).nullable())
	.handler(async ({ data }) => {
		try {
			const fileList = data?.getAll("files");
			if (!fileList || fileList.length === 0) {
				return [];
			}
			const files = Array.from(fileList || []);
			const fileUploadsPromise = files.map(uploadImage);
			const fileUploads = await Promise.all(fileUploadsPromise);
			return fileUploads;
		} catch (err) {
			console.log("Error: ", err);
		}
	});
