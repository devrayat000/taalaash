"use client";

import * as z from "zod";
import { useState, useTransition } from "react";
import { useFormStatus, useFormState } from "react-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "@/components/ui/use-toast";
import { Trash } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { InferSelectModel } from "drizzle-orm";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Heading } from "@/components/ui/heading";
import { AlertModal } from "@/components/modals/alert-modal";
import { subject } from "@/db/schema";
import {
  createSubject,
  deleteSubject,
  updateSubject,
} from "@/server/subject/action/subject";

const formSchema = z.object({
  name: z.string().min(1),
});

type SubjectFormValues = z.infer<typeof formSchema>;
type Subject = InferSelectModel<typeof subject>;
interface SubjectFormProps {
  initialData: Subject | null;
}

export const SubjectForm: React.FC<SubjectFormProps> = ({ initialData }) => {
  const params = useParams();
  const router = useRouter();
  const [isTransitioning, startTransition] = useTransition();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const title = initialData ? "Edit subject" : "Create subject";
  const description = initialData ? "Edit a subject." : "Add a new subject";
  const toastMessage = initialData ? "Subject updated." : "Subject created.";
  const action = initialData ? "Save changes" : "Create";

  const form = useForm<SubjectFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name ?? "",
    },
  });

  const onSubmit = async (data: SubjectFormValues) => {
    try {
      setLoading(true);

      if (initialData) {
        await updateSubject(initialData.id, data);
        router.refresh();
      } else {
        const { id } = await createSubject(data);
        router.replace(`/admin/subjects/${id}`);
      }
      toast({ description: toastMessage });
    } catch (error: any) {
      toast({ description: "Something went wrong.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async () => {
    try {
      setLoading(true);
      if (typeof params.subjectId === "string")
        await deleteSubject(params.subjectId as string);
      router.replace(`/admin/subjects`);
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
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-y-8 max-w-lg mx-auto"
        >
          <div className="flex flex-col items-stretch gap-y-4">
            <FormField
              control={form.control}
              name="name"
              disabled={loading}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Subject name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button disabled={loading} className="ml-auto" type="submit">
            {action}
          </Button>
        </form>
      </Form>
    </>
  );
};
