import { eq, inArray, InferInsertModel } from "drizzle-orm";
import map from "lodash/map";
import { any, object, string, number, array } from "zod";
import merge from "lodash/merge";
import pick from "lodash/pick";
import { put } from "@vercel/blob";
import { createWorker } from "tesseract.js";

import { post } from "@/db/schema";
import db from "@/lib/db";
// import {
// 	saveIndex,
// 	deleteIndex,
// 	deleteManyIndices,
// 	saveManyIndices,
// 	saveManyIndicesByIds,
// } from "@/webhooks/saveIndex";
import { env } from "@/lib/utils";
import { createServerFn } from "@tanstack/react-start";

type PostInput = Omit<InferInsertModel<typeof post>, "id">;

const createPostSchema = object({
	id: string().uuid(),
	imageUrl: string().url("Invalid URL"),
	chapterId: string().min(1, "Chapter ID is required"),
	keywords: array(string()).optional().default([]),
	page: number().int(),
});

export const createPost = createServerFn({ method: "POST" })
	.validator(array(createPostSchema).or(createPostSchema))
	.handler(async ({ data: params }) => {
		const results = await db
			.insert(post)
			.values(Array.isArray(params) ? params : [params])
			.returning({ id: post.id });
		return results;

		// if (Array.isArray(params)) {
		// 	await saveManyIndicesByIds(results.map((r) => r.id));
		// 	// revalidatePath("/admin/posts");
		// 	return results;
		// } else {
		// 	await saveIndex(results[0].id);
		// 	// revalidatePath("/admin/posts");
		// 	return results[0];
		// }
	});

export const updatePost = createServerFn({ method: "POST" })
	.validator(
		object({
			id: string().uuid(),
			params: createPostSchema.partial(),
		}),
	)
	.handler(async ({ data: { id, params } }) => {
		const [data] = await db
			.update(post)
			.set(params)
			.where(eq(post.id, id))
			.returning({ id: post.id });

		// await saveIndex(data.id);
		// revalidatePath("/admin/posts");
		// redirect(`/admin/posts`);
		// return data;
	});

export const deletePost = createServerFn({ method: "POST" })
	.validator(object({ id: string() }))
	.handler(async ({ data: { id } }) => {
		await db.delete(post).where(eq(post.id, id));
		// await deleteIndex(id);
		// revalidatePath("/admin/posts");
		// redirect(`/admin/posts`);
	});

export const deleteManyPosts = createServerFn({ method: "POST" })
	.validator(object({ ids: array(string()) }))
	.handler(async ({ data: { ids } }) => {
		await db.delete(post).where(inArray(post.id, ids));
		// await deleteManyIndices(ids);
		// revalidatePath("/admin/posts");
		// redirect(`/admin/posts`);
	});

// export async function bulkUploadPosts(formData: FormData) {
// 	const files = formData.getAll("files");

// 	// console.log(files.length);

// 	const blobsPrommise = files
// 		.map((file) => {
// 			if (typeof file !== "string") {
// 				return put(`demo/${file.name}`, file, {
// 					access: "public",
// 					multipart: true,
// 				});
// 			}
// 		})
// 		.filter(Boolean);

// 	const fetchUrl = new URL(
// 		"/bulk-upload",
// 		env("OCR_URL", "http://127.0.0.1:8000"),
// 	);
// 	const extractedPromise = fetch(fetchUrl, {
// 		method: "POST",
// 		body: formData,
// 	})
// 		.then((res) => res.json())
// 		.then((data) => data.results as { text: string; file: string }[]);

// 	const [blobs, results] = await Promise.all([
// 		Promise.all(blobsPrommise),
// 		extractedPromise,
// 	]);

// 	const data = merge(blobs, results).map((obj) => ({
// 		//   @ts-ignore
// 		text: obj.text,
// 		imageUrl: obj!.url,
// 		chapterId: formData.get("chapterId")!.toString(),
// 	}));

// 	await createPost(data);

// 	return data;
// }
