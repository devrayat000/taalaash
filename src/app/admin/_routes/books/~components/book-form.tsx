import { z } from "zod/mini";
import { use, useEffect, useRef, useState } from "react";
import { Trash } from "lucide-react";
import type { InferSelectModel } from "drizzle-orm";

import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Heading } from "@/components/ui/heading";
import { AlertModal } from "@/components/modals/alert-modal";
import type { bookAuthor, subject } from "@/db/schema";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { createBook, deleteBook, updateBook } from "@/server/book/action/book";
import { upload } from "@vercel/blob/client";
import { createFile } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import DropZoneInput from "@/components/drop-zone";
import { useNavigate, useParams } from "@tanstack/react-router";
import { useForm } from "@tanstack/react-form";
import { Label } from "@/components/ui/label";

let formSchema = z.object({
	name: z.string().check(z.minLength(1)),
	subjectId: z.string().check(z.minLength(1)),
	edition: z.string().check(z.minLength(1)),
	marked: z._default(z.boolean(), false),
});

if (typeof window !== "undefined") {
	formSchema = z.extend(formSchema, {
		embed: z.nullable(
			z
				.instanceof(globalThis.File)
				.check(z.refine((file) => file.size > 0, "File cannot be empty")),
		),
	});
}

type BookFormValues = z.infer<typeof formSchema> & {
	embed: File | null;
};
type Subject = InferSelectModel<typeof subject>;
type Book = InferSelectModel<typeof bookAuthor> & {
	subject: {
		id: string;
		name: string;
	};
};
interface BookFormProps {
	initialData: {
		subjects: Subject[];
		book: Book | null;
	};
}

export const BookForm: React.FC<BookFormProps> = ({
	initialData: { book: initialData, subjects },
}) => {
	const params = useParams({ from: "/admin/_routes/books/$bookId" });
	const navigate = useNavigate();
	const embedRef = useRef<HTMLInputElement>(null);

	const [open, setOpen] = useState(false);
	const [loading, setLoading] = useState(false);

	const title = initialData ? "Edit book" : "Create book";
	const description = initialData ? "Edit a book." : "Add a new book";
	const toastMessage = initialData ? "Book updated." : "Book created.";
	const action = initialData ? "Save changes" : "Create";

	const defaultEmbed = initialData?.coverUrl
		? use(createFile(initialData.coverUrl, "image/jpeg"))
		: null;

	const form = useForm({
		defaultValues: {
			name: initialData?.name ?? "",
			subjectId: initialData?.subject.id ?? "",
			edition: initialData?.edition ?? "",
			marked: initialData?.marked ?? false,
			embed: defaultEmbed,
		},
		validators: {
			onSubmit: formSchema,
		},
		onSubmit: async ({ value: data }) => {
			try {
				setLoading(true);

				if (
					!!data.embed &&
					initialData?.coverUrl?.split("/")?.pop() !== data.embed?.name
				) {
					const newBlob = await upload(`books/${data.embed.name}`, data.embed, {
						access: "public",
						handleUploadUrl: "/api/image/upload",
						multipart: true,
					});
					// @ts-ignore
					data["coverUrl"] = newBlob.url;
				}

				if (initialData) {
					await updateBook({
						data: {
							id: initialData.id,
							params: {
								name: data.name,
								subjectId: data.subjectId,
								edition: data.edition,
								marked: data.marked,
								// @ts-ignore
								coverUrl: data["coverUrl"],
							},
						},
					});
					navigate({ reloadDocument: true });
				} else {
					const result = await createBook({
						data: {
							name: data.name,
							subjectId: data.subjectId,
							edition: data.edition,
							marked: data.marked,
							// @ts-ignore
							coverUrl: data["coverUrl"],
						},
					});
					navigate({
						to: "/admin/books/$bookId",
						params: { bookId: result.id },
					});
				}
				toast.success(toastMessage);
			} catch {
				toast.error("Something went wrong.");
			} finally {
				setLoading(false);
			}
		},
	});

	useEffect(() => {
		if (embedRef.current && initialData?.coverUrl && defaultEmbed) {
			const dataTransfer = new DataTransfer();
			dataTransfer.items.add(defaultEmbed);
			embedRef.current.files = dataTransfer.files;
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [initialData?.coverUrl, defaultEmbed]);

	const onDelete = async () => {
		try {
			setLoading(true);
			if (typeof params?.bookId === "string")
				await deleteBook({ data: { id: params.bookId } });
			navigate({
				to: "/admin/books",
			});
			toast.success("Book deleted.");
		} catch {
			toast.error("Make sure you removed all products using this book first.");
		} finally {
			setLoading(false);
			setOpen(false);
		}
	};

	return (
		<>
			{initialData && (
				<AlertModal
					isOpen={open}
					onClose={() => setOpen(false)}
					onConfirm={onDelete}
					loading={loading}
				/>
			)}
			<div className="flex items-center justify-between">
				<Heading title={title} description={description} />
				{initialData && (
					<Button
						disabled={loading}
						variant="destructive"
						size="sm"
						onClick={() => setOpen(true)}
					>
						<Trash className="h-4 w-4" />
					</Button>
				)}
			</div>
			<Separator />
			<form
				onSubmit={form.handleSubmit}
				className="flex flex-col gap-y-8 max-w-lg mx-auto"
			>
				<div className="flex flex-col items-stretch gap-y-4">
					<form.Field name="subjectId">
						{(field) => (
							<div>
								<Label htmlFor={field.name}>Subject</Label>
								<Select
									onValueChange={field.handleChange}
									value={field.state.value}
									disabled={loading}
									required
								>
									<SelectTrigger>
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
					<form.Field name="name">
						{(field) => (
							<div>
								<Label htmlFor={field.name}>Name</Label>
								<Input
									id={field.name}
									name={field.name}
									placeholder="Book name"
									onChange={(e) => field.handleChange(e.target.value)}
									onBlur={field.handleBlur}
									disabled={loading}
								/>
								{/* <FormMessage /> */}
							</div>
						)}
					</form.Field>
					<form.Field name="embed">
						{(field) => (
							<div>
								<Label htmlFor={field.name}>Book Cover</Label>
								<DropZoneInput
									ref={embedRef}
									onFileDrop={(files) =>
										field.handleChange(files.length ? files[0] : undefined)
									}
									defaultFile={field.state.value || undefined}
								/>
								{/* <FormMessage /> */}
							</div>
						)}
					</form.Field>
					<div className="grid grid-cols-2 gap-x-5">
						<form.Field name="edition">
							{(field) => (
								<div>
									<Label htmlFor={field.name}>Edition</Label>
									<Input
										id={field.name}
										name={field.name}
										placeholder="Edition"
										onChange={(e) => field.handleChange(e.target.value)}
										onBlur={field.handleBlur}
										disabled={loading}
									/>
									{/* <FormMessage /> */}
								</div>
							)}
						</form.Field>
						<form.Field name="marked">
							{(field) => (
								<div>
									<Label htmlFor={field.name}>Marked book</Label>
									<Switch
										checked={field.state.value}
										onCheckedChange={field.handleChange}
										className="block"
									/>
									{/* <FormMessage /> */}
								</div>
							)}
						</form.Field>
					</div>
				</div>
				<Button disabled={loading} className="ml-auto" type="submit">
					{action}
				</Button>
			</form>
		</>
	);
};
