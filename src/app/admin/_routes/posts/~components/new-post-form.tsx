import { z } from "zod";
import { Suspense, use, useEffect, useRef, useState } from "react";
import { useFormState } from "react-dom";
import { useForm, useStore } from "@tanstack/react-form";
import { toast } from "@/components/ui/use-toast";
import { FileImageIcon, Paperclip, Trash } from "lucide-react";
import { useParams, useRouter, useNavigate } from "@tanstack/react-router";
import { InferSelectModel } from "drizzle-orm";
import zip from "lodash/zip";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Heading } from "@/components/ui/heading";
import { AlertModal } from "@/components/modals/alert-modal";
import { bookAuthor, chapter, post, subject } from "@/db/schema";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { createPost, deletePost, updatePost } from "@/server/post/action";
import { getBooksBySubject } from "@/server/book/action/book";
import { getChaptersByBooks } from "@/server/chapter/action/chapter";
import { Textarea } from "@/components/ui/textarea";
import {
	FileUploader,
	FileUploaderContent,
	FileUploaderItem,
	FileInput,
} from "@/components/ui/drop-zone";
import { createFile, env } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { Loader } from "@/components/ui/loader";
import { Label } from "@/components/ui/label";
import { useQuery } from "@tanstack/react-query";
import { getAllSubjects } from "@/server/subject/service";
import { indexDocuments, recognizeText } from "@/server/post/action/indexing";
import { uploadPostImages } from "@/server/post/action/upload-post-image";

const postFormSchema = z.object({
	subjectId: z.string().min(1),
	bookAuthorId: z.string().min(1),
	chapterId: z.string().min(1),
	files: z.file().array(),
	pages: z.string().transform((val) => parsePageRange(val)),
});

function parsePageRange(input: string): number[] {
	if (!input) return [];
	const pages = new Set<number>();
	input.split(",").forEach((part) => {
		part = part.trim();
		if (!part) return;
		if (part.includes("-")) {
			// range
			const [start, end] = part.split("-").map(Number);
			if (Number.isNaN(start) || Number.isNaN(end)) return;
			for (let i = start; i <= end; i++) pages.add(i);
		} else {
			// single number
			const num = Number(part);
			if (!Number.isNaN(num)) pages.add(num);
		}
	});
	return Array.from(pages).sort((a, b) => a - b);
}

export const NewPostForm = () => {
	const router = useRouter();
	const navigate = useNavigate();

	const [open, setOpen] = useState(false);
	const [loading, setLoading] = useState(false);
	const embedRef = useRef<HTMLInputElement>(null);

	const form = useForm({
		defaultValues: {
			subjectId: "",
			bookAuthorId: "",
			chapterId: "",
			files: [] as File[],
			pages: "",
		},
		validators: {
			onSubmitAsync: postFormSchema,
		},
		onSubmit: async ({ value: { subjectId, bookAuthorId, ...data } }) => {
			try {
				console.log("submitting");
				const formData = new FormData();
				formData.append("subjectId", subjectId);
				formData.append("bookAuthorId", bookAuthorId);
				formData.append("chapterId", data.chapterId);
				if (data.files && Array.isArray(data.files)) {
					data.files.forEach((file: File) => {
						formData.append("files", file);
					});
				}

				const { dismiss } = toast({
					title: "Uploading files...",
					variant: "default",
					description: <Loader />,
					duration: Infinity,
				});

				const [imageTexts, images] = await Promise.all([
					recognizeText({ data: formData }),
					uploadPostImages({ data: formData }),
				]);
				console.log("Image texts:", imageTexts);
				console.log("Uploaded images:", images);

				const chapterId = formData.get("chapterId")!.toString();

				const docs = await indexDocuments({
					data: { chapterId, documents: imageTexts.map((obj) => obj.text) },
				});

				console.log("Indexed documents:", docs);

				const pages =
					typeof data.pages === "string"
						? parsePageRange(data.pages)
						: data.pages;

				const newPosts = zip(imageTexts, images!, docs, pages).map(
					([imageText, image, doc, page]) => ({
						//   @ts-ignore
						id: doc.id,
						imageUrl: image?.fileUrl,
						chapterId: formData.get("chapterId")!.toString(),
						page,
					}),
				);
				console.log("New posts data:", newPosts);

				await createPost({ data: newPosts });

				// await createPost({ data });
				dismiss();
				// router.replace(`/admin/posts`);
				navigate({
					to: "/admin/posts",
					reloadDocument: true,
				});
			} catch (error) {
				console.log("Error uploading post:", error);
			}
		},
	});

	const { data: subjects } = useQuery({
		queryKey: ["subjects"],
		queryFn: () => getAllSubjects(),
		initialData: [],
	});

	const subjectId = useStore(form.store, (state) => state.values.subjectId);
	const { data: booksBySubject, isLoading: isBooksLoading } = useQuery({
		queryKey: ["books", subjectId],
		queryFn: () => getBooksBySubject({ data: { id: subjectId } }),
		enabled: !!subjectId,
	});

	const bookId = useStore(form.store, (state) => state.values.bookAuthorId);
	const { data: chaptersByBook, isLoading: isChaptersLoading } = useQuery({
		queryKey: ["chapters", bookId],
		queryFn: () => getChaptersByBooks({ data: { id: bookId } }),
		enabled: !!bookId,
	});

	return (
		<>
			<div className="flex items-center justify-between">
				<Heading title="Upload Pages" description="" />
			</div>
			<Separator />
			<form
				onSubmit={(e) => {
					e.preventDefault();
					form.handleSubmit(e);
				}}
				className="flex flex-col gap-y-8 max-w-lg mx-auto"
			>
				<div className="flex flex-col items-stretch gap-y-4">
					<form.Field name="subjectId">
						{(field) => (
							<div>
								<Label>Subject</Label>
								<Select
									onValueChange={(value) => {
										field.handleChange(value);
										// getBooksAction(value);
									}}
									value={field.state.value}
									required
									disabled={loading}
								>
									<SelectTrigger onBlur={field.handleBlur}>
										<SelectValue placeholder="Select a subject" />
									</SelectTrigger>
									<SelectContent>
										{subjects.map((subject) => (
											<SelectItem key={subject.id} value={subject.id}>
												{subject.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								{/* <FormMessage /> */}
							</div>
						)}
					</form.Field>
					<form.Field name="bookAuthorId">
						{(field) => (
							<div>
								<Label>Book/Author</Label>
								<Select
									onValueChange={(value) => {
										field.handleChange(value);
										// getChaptersAction(value);
									}}
									value={field.state.value}
									disabled={!booksBySubject || loading || isBooksLoading}
									required
								>
									<SelectTrigger>
										<SelectValue placeholder="Select a book" />
									</SelectTrigger>
									<SelectContent>
										{booksBySubject?.map((book) => (
											<SelectItem key={book.id} value={book.id}>
												{book.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								{/* <FormMessage /> */}
							</div>
						)}
					</form.Field>
					<form.Field name="chapterId">
						{(field) => (
							<div>
								<Label>Chapter</Label>
								<Select
									onValueChange={field.handleChange}
									value={field.state.value}
									disabled={!chaptersByBook || loading}
									required
								>
									<SelectTrigger>
										<SelectValue placeholder="Select a chapter" />
									</SelectTrigger>
									<SelectContent>
										{chaptersByBook?.map((chapter) => (
											<SelectItem key={chapter.id} value={chapter.id}>
												{chapter.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								{/* <FormMessage /> */}
							</div>
						)}
					</form.Field>
					<form.Field name="files">
						{(field) => (
							<div>
								<Label>Image</Label>
								<Suspense>
									<FileUploader
										value={field.state.value || []}
										onValueChange={(files) => {
											!!files && !!files.length && field.handleChange(files);
										}}
										dropzoneOptions={{
											maxFiles: 100,
											maxSize: 1024 * 1024 * 4,
											multiple: true,
											accept: {
												"image/jpeg": [],
												"image/png": [],
											},
										}}
										className="relative bg-background rounded-lg p-2"
									>
										<FileInput className="outline-dashed outline-1 outline-white">
											<div className="flex items-center justify-center flex-col pt-3 pb-4 w-full ">
												<FileImageIcon />
											</div>
										</FileInput>
										<FileUploaderContent>
											{field.state.value &&
												field.state.value.length > 0 &&
												field.state.value.map((file, i) => (
													<FileUploaderItem key={i} index={i}>
														<Paperclip className="h-4 w-4 stroke-current" />
														<span>{file.name}</span>
													</FileUploaderItem>
												))}
										</FileUploaderContent>
									</FileUploader>
								</Suspense>
								<p className="text-sm text-muted-foreground">
									Supported formats: JPEG, PNG. Max size: 4MB per file.
								</p>
							</div>
						)}
					</form.Field>
					<form.Field name="pages">
						{(field) => (
							<div>
								<Label>Page Numbers</Label>
								<Input
									type="text"
									placeholder="1, 2, 3-5, 7"
									value={field.state.value}
									onChange={(e) => field.handleChange(e.target.value)}
									onBlur={field.handleBlur}
									disabled={loading}
								/>
								<p className="text-sm text-muted-foreground">
									Enter page numbers or ranges (e.g., 1, 2, 3-5)
								</p>
							</div>
						)}
					</form.Field>
				</div>
				<Button disabled={loading} className="ml-auto" type="submit">
					Upload
				</Button>
			</form>
		</>
	);
};
