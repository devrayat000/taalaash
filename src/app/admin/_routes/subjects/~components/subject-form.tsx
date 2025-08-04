import * as z from "zod";
import { useState, useTransition } from "react";
import { toast } from "@/components/ui/use-toast";
import { Trash } from "lucide-react";
import type { InferSelectModel } from "drizzle-orm";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Heading } from "@/components/ui/heading";
import { AlertModal } from "@/components/modals/alert-modal";
import { subject } from "@/db/schema";
import {
	deleteSubjectFn,
	createSubjectFn,
	updateSubjectFn,
} from "@/server/subject/function";
import { useNavigate, useParams } from "@tanstack/react-router";
import { useForm } from "@tanstack/react-form";
import { Label } from "@/components/ui/label";

const formSchema = z.object({
	name: z.string().min(1),
});

type SubjectFormValues = z.infer<typeof formSchema>;
type Subject = InferSelectModel<typeof subject>;
interface SubjectFormProps {
	initialData: Subject | null;
}

export const SubjectForm: React.FC<SubjectFormProps> = ({ initialData }) => {
	const params = useParams({ from: "/admin/_routes/subjects/$subjectId" });
	const navigate = useNavigate();
	const [isTransitioning, startTransition] = useTransition();

	const [open, setOpen] = useState(false);
	const [loading, setLoading] = useState(false);

	const title = initialData ? "Edit subject" : "Create subject";
	const description = initialData ? "Edit a subject." : "Add a new subject";
	const toastMessage = initialData ? "Subject updated." : "Subject created.";
	const action = initialData ? "Save changes" : "Create";

	const form = useForm({
		defaultValues: {
			name: initialData?.name ?? "",
		},
		validators: {
			onSubmit: formSchema,
		},
		onSubmit: async ({ value: data }) => {
			try {
				setLoading(true);

				if (initialData) {
					await updateSubjectFn({ data: { id: initialData.id, params: data } });
					navigate({ reloadDocument: true });
				} else {
					const { id } = await createSubjectFn({ data });
					navigate({
						to: "/admin/subjects/$subjectId",
						params: { subjectId: id },
					});
				}
				toast({ description: toastMessage });
			} catch (error: any) {
				toast({ description: "Something went wrong.", variant: "destructive" });
			} finally {
				setLoading(false);
			}
		},
	});

	const onDelete = async () => {
		try {
			setLoading(true);
			if (typeof params.subjectId === "string")
				await deleteSubjectFn({ data: { id: params.subjectId } });
			navigate({
				to: "/admin/subjects",
			});
			toast({ description: "Subject deleted." });
		} catch (error: any) {
			toast({
				description:
					"Make sure you removed all products using this subject first.",
				variant: "destructive",
			});
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
					<form.Field name="name">
						{(field) => (
							<div>
								<Label htmlFor={field.name}>Name</Label>
								<Input
									name={field.name}
									id={field.name}
									placeholder="Subject name"
									onChange={(e) => field.handleChange(e.target.value)}
									onBlur={field.handleBlur}
									disabled={loading}
								/>
								{/* <FormMessage /> */}
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
