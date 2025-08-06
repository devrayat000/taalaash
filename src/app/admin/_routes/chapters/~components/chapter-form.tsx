import * as z from "zod";
import { useState } from "react";
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
import {
	createChapterFn,
	deleteChapterFn,
	updateChapterFn,
} from "@/server/chapter/function";
import { getBooksBySubject } from "@/server/book/action/book";
import { useNavigate, useParams } from "@tanstack/react-router";
import { useForm } from "@tanstack/react-form";
import { Label } from "@/components/ui/label";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { ChapterTable } from "@/server/chapter/service";

const formSchema = z.object({
	name: z.string().min(1),
	subjectId: z.string().min(1),
	bookAuthorId: z.string().min(1),
});

type Subject = InferSelectModel<typeof subject>;
type Chapter = ChapterTable;

interface ChapterFormProps {
	initialData: {
		subjects: Subject[];
		books: InferSelectModel<typeof bookAuthor>[] | null;
		chapter: Chapter | null;
	};
}

export const ChapterForm: React.FC<ChapterFormProps> = ({
	initialData: { chapter: initialData, subjects, books: initialBooks = null },
}) => {
	const params = useParams({ from: "/admin/_routes/chapters/$chapterId" });
	const navigate = useNavigate();
	const queryClient = useQueryClient();

	const [open, setOpen] = useState(false);
	const [loading, setLoading] = useState(false);
	const [selectedSubjectId, setSelectedSubjectId] = useState(
		initialData?.subject.id ?? "",
	);

	const title = initialData ? "Edit chapter" : "Create chapter";
	const description = initialData ? "Edit a chapter." : "Add a new chapter";
	const toastMessage = initialData ? "Chapter updated." : "Chapter created.";
	const action = initialData ? "Save changes" : "Create";

	// Fetch books for selected subject
	const { data: books } = useQuery({
		queryKey: ["books-by-subject", selectedSubjectId],
		queryFn: async () => {
			if (!selectedSubjectId) return null;
			return await getBooksBySubject({ data: { id: selectedSubjectId } });
		},
		enabled: !!selectedSubjectId,
		initialData:
			selectedSubjectId === initialData?.subject.id ? initialBooks : null,
	});

	const form = useForm({
		defaultValues: {
			name: initialData?.name ?? "",
			subjectId: initialData?.subject.id ?? "",
			bookAuthorId: initialData?.book.id ?? "",
		},
		validators: {
			onSubmit: formSchema,
		},
		onSubmit: async ({ value: data }) => {
			try {
				setLoading(true);
				if (initialData) {
					await updateChapterFn({
						data: {
							id: initialData.id,
							params: {
								name: data.name,
								bookAuthorId: data.bookAuthorId,
							},
						},
					});
					navigate({ reloadDocument: true });
				} else {
					const result = await createChapterFn({
						data: {
							name: data.name,
							bookAuthorId: data.bookAuthorId,
						},
					});
					navigate({
						to: "/admin/chapters/$chapterId",
						params: { chapterId: result.id },
					});
				}
				toast.success(toastMessage);
				queryClient.invalidateQueries({ queryKey: ["chapters"] });
			} catch {
				toast.error("Something went wrong.");
			} finally {
				setLoading(false);
			}
		},
	});

	const onDelete = async () => {
		try {
			setLoading(true);
			if (typeof params?.chapterId === "string")
				await deleteChapterFn({ data: { id: params.chapterId } });
			navigate({
				to: "/admin/chapters",
			});
			toast.success("Chapter deleted.");
			queryClient.invalidateQueries({ queryKey: ["chapters"] });
		} catch {
			toast.error(
				"Make sure you removed all products using this chapter first.",
			);
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
									onValueChange={(value) => {
										field.handleChange(value);
										setSelectedSubjectId(value);
										// Reset book selection when subject changes
										form.setFieldValue("bookAuthorId", "");
									}}
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
							</div>
						)}
					</form.Field>
					<form.Field name="bookAuthorId">
						{(field) => (
							<div>
								<Label htmlFor={field.name}>Book/Author</Label>
								<Select
									onValueChange={field.handleChange}
									value={field.state.value}
									disabled={loading || !books}
									required
								>
									<SelectTrigger>
										<SelectValue placeholder="Select a book" />
									</SelectTrigger>
									<SelectContent>
										{books?.map((book) => (
											<SelectItem key={book.id} value={book.id}>
												{book.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
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
									placeholder="Chapter name"
									onChange={(e) => field.handleChange(e.target.value)}
									onBlur={field.handleBlur}
									disabled={loading}
								/>
							</div>
						)}
					</form.Field>
				</div>
				<Button disabled={loading} className="ml-auto" type="submit">
					{action}
				</Button>
			</form>
		</>
	);
};
