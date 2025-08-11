import { z } from "zod/mini";
import { Suspense, useState } from "react";
import { useForm, useStore } from "@tanstack/react-form";
import { FileImageIcon, Paperclip } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Heading } from "@/components/ui/heading";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { getBooksBySubject } from "@/server/book/action/book";
import { getChaptersByBookFn } from "@/server/chapter/function/get";
import {
	FileUploader,
	FileUploaderContent,
	FileUploaderItem,
	FileInput,
} from "@/components/ui/drop-zone";
import { Loader } from "@/components/ui/loader";
import { Label } from "@/components/ui/label";
import { useQuery } from "@tanstack/react-query";
import { getSubjectsFn } from "@/server/subject/function";
import { bulkUploadWithOCRFn } from "@/server/post/function/indexing";

const postFormSchema = z.object({
	subjectId: z.string().check(z.minLength(1)),
	bookAuthorId: z.string().check(z.minLength(1)),
	chapterId: z.string().check(z.minLength(1)),
	files: z.array(z.file()),
	pages: z.pipe(
		z.string(),
		z.transform((val) => parsePageRange(val)),
	),
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
	const navigate = useNavigate();

	const [loading, setLoading] = useState(false);

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
				console.log("Starting bulk upload with OCR workflow");
				setLoading(true);

				// Parse page numbers for validation
				const pages =
					typeof data.pages === "string"
						? parsePageRange(data.pages)
						: data.pages;

				// Validate files and pages
				if (!data.files || data.files.length === 0) {
					toast.error("Please select at least one file to upload");
					throw new Error("Please select at least one file to upload");
				}

				if (pages.length === 0) {
					toast.error("Please specify page numbers");
					throw new Error("Please specify page numbers");
				}

				if (pages.length !== data.files.length) {
					toast.warning(
						`Number of page numbers (${pages.length}) must match number of files (${data.files.length})`,
					);
					throw new Error(
						`Number of page numbers (${pages.length}) must match number of files (${data.files.length})`,
					);
				}

				const formData = new FormData();
				formData.append("chapterId", data.chapterId);

				// Add files to FormData
				data.files.forEach((file: File) => {
					formData.append("files", file);
				});

				// Add page metadata to FormData
				formData.append("pages", JSON.stringify(pages));

				const loadingToastId = toast.loading(
					<div>
						<Loader />
						<p className="mt-2 text-sm">
							Uploading {data.files.length} images → OCR processing → Indexing →
							Saving posts
						</p>
						<p className="text-xs text-muted-foreground mt-1">
							Pages: {pages.join(", ")}
						</p>
					</div>,
					{
						duration: Infinity,
					},
				);

				// Call the new bulk upload with OCR workflow
				const result = await bulkUploadWithOCRFn({ data: formData });

				console.log("Bulk upload initiated:", result);

				toast.dismiss(loadingToastId);

				// Show success message with batch info
				toast.success(
					<div>
						<p>Batch ID: {result.batch_id}</p>
						<p>Processing {result.total} files with page metadata...</p>
						<p className="text-xs text-muted-foreground mt-1">
							Pages: {pages.join(", ")}
						</p>
						<p className="text-sm text-muted-foreground mt-1">
							OCR processing is running in the background. Results will be saved
							automatically when complete.
						</p>
					</div>,
					{
						duration: 10000,
					},
				);

				// Navigate back to posts list
				navigate({
					reloadDocument: true,
				});
			} catch (error) {
				console.error("Error in bulk upload workflow:", error);
				toast.error(
					error instanceof Error ? error.message : "Unknown error occurred",
					{
						duration: 8000,
					},
				);
			} finally {
				setLoading(false);
			}
		},
	});

	const { data: subjects } = useQuery({
		queryKey: ["subjects"],
		queryFn: () => getSubjectsFn().then((res) => res.data),
		initialData: [],
	});

	const subjectId = useStore(form.store, (state) => state.values.subjectId);
	const { data: booksBySubject, isLoading: isBooksLoading } = useQuery({
		queryKey: ["books", subjectId],
		queryFn: () => getBooksBySubject({ data: { id: subjectId } }),
		enabled: !!subjectId,
	});

	const bookId = useStore(form.store, (state) => state.values.bookAuthorId);
	const { data: chaptersByBook } = useQuery({
		queryKey: ["chapters", bookId],
		queryFn: () => getChaptersByBookFn({ data: { bookAuthorId: bookId } }),
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
													<FileUploaderItem
														key={`${file.name}-${file.size}-${i}`}
														index={i}
													>
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
								<div className="text-sm text-muted-foreground space-y-1">
									<p>Enter page numbers or ranges (e.g., 1, 2, 3-5)</p>
									<p className="text-xs">
										Number of pages must match the number of uploaded files
									</p>
									{field.state.value &&
										(() => {
											const pages = parsePageRange(field.state.value);
											const files = form.store.state.values.files;
											const fileCount = files ? files.length : 0;
											return (
												<p
													className={`text-xs ${
														pages.length === fileCount
															? "text-green-600"
															: "text-amber-600"
													}`}
												>
													{pages.length > 0 && (
														<>
															Pages: {pages.join(", ")} ({pages.length} total)
														</>
													)}
													{fileCount > 0 && <> • Files: {fileCount}</>}
												</p>
											);
										})()}
								</div>
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
