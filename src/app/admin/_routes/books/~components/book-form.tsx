// "use client";

// import * as z from "zod";
// import {
//   use,
//   useEffect,
//   useMemo,
//   useRef,
//   useState,
//   useTransition,
// } from "react";
// import { useFormStatus, useFormState } from "react-dom";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { useForm, useWatch } from "react-hook-form";
// import { Trash } from "lucide-react";
// import { useParams, useRouter } from "next/navigation";
// import { InferSelectModel } from "drizzle-orm";
// import { useServerAction } from "zsa-react";

// import { toast } from "@/components/ui/use-toast";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { Separator } from "@/components/ui/separator";
// import { Heading } from "@/components/ui/heading";
// import { AlertModal } from "@/components/modals/alert-modal";
// import { bookAuthor, subject } from "@/db/schema";
// import {
//   Select,
//   SelectContent,
//   SelectGroup,
//   SelectItem,
//   SelectLabel,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { createBook, deleteBook, updateBook } from "@/server/book/action/book";
// import { upload } from "@vercel/blob/client";
// import { createFile } from "@/lib/utils";
// import { Switch } from "@/components/ui/switch";
// import DropZoneInput from "@/components/drop-zone";

// let formSchema = z.object({
//   name: z.string().min(1),
//   subjectId: z.string().min(1),
//   edition: z.string().min(1),
//   marked: z.boolean().default(false),
// });

// if (typeof window !== "undefined") {
//   formSchema = formSchema.extend({
//     embed: z
//       .instanceof(globalThis.File)
//       .refine((file) => file.size > 0, "File cannot be empty")
//       .nullable(),
//   });
// }

// type BookFormValues = z.infer<typeof formSchema> & {
//   embed: File | null;
// };
// type Subject = InferSelectModel<typeof subject>;
// type Book = InferSelectModel<typeof bookAuthor> & {
//   subject: {
//     id: string;
//     name: string;
//   };
// };
// interface BookFormProps {
//   initialData: {
//     subjects: Subject[];
//     book: Book | null;
//   };
// }

// export const BookForm: React.FC<BookFormProps> = ({
//   initialData: { book: initialData, subjects },
// }) => {
//   const params = useParams();
//   const router = useRouter();
//   const embedRef = useRef<HTMLInputElement>(null);

//   const [open, setOpen] = useState(false);
//   const [loading, setLoading] = useState(false);

//   const title = initialData ? "Edit book" : "Create book";
//   const description = initialData ? "Edit a book." : "Add a new book";
//   const toastMessage = initialData ? "Book updated." : "Book created.";
//   const action = initialData ? "Save changes" : "Create";

//   const defaultEmbed = initialData?.coverUrl
//     ? use(createFile(initialData.coverUrl, "image/jpeg"))
//     : null;

//   const form = useForm<BookFormValues>({
//     resolver: zodResolver(formSchema, { async: true }),
//     defaultValues: {
//       name: initialData?.name ?? "",
//       subjectId: initialData?.subject.id ?? "",
//       edition: initialData?.edition ?? "",
//       marked: initialData?.marked ?? false,
//       embed: defaultEmbed,
//     },
//   });

//   const { isPending, execute } = useServerAction(createBook);

//   useEffect(() => {
//     if (embedRef.current && initialData?.coverUrl) {
//       const dataTransfer = new DataTransfer();
//       dataTransfer.items.add(defaultEmbed!);
//       embedRef.current.files = dataTransfer.files;
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [initialData?.coverUrl]);

//   const onSubmit = async (data: BookFormValues) => {
//     try {
//       setLoading(true);

//       if (
//         !!data.embed &&
//         initialData?.coverUrl?.split("/")?.pop() !== data.embed?.name
//       ) {
//         const newBlob = await upload(`books/${data.embed.name}`, data.embed, {
//           access: "public",
//           handleUploadUrl: "/api/image/upload",
//           multipart: true,
//         });
//         // @ts-ignore
//         data["coverUrl"] = newBlob.url;
//       }

//       if (initialData) {
//         await updateBook(initialData.id, data);
//         router.refresh();
//       } else {
//         const [d, err] = await execute({
//           name: data.name,
//           subjectId: data.subjectId,
//           edition: data.edition,
//           marked: data.marked,
//           // @ts-ignore
//           coverUrl: data["coverUrl"],
//         });
//         if (d) {
//           router.replace(`/admin/books/${d.id}`);
//         } else {
//           toast({
//             description: "Something went wrong.",
//             variant: "destructive",
//           });
//         }
//       }
//       toast({ description: toastMessage });
//     } catch (error: any) {
//       toast({ description: "Something went wrong.", variant: "destructive" });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const onDelete = async () => {
//     try {
//       setLoading(true);
//       if (typeof params?.bookId === "string")
//         await deleteBook(params.bookId as string);
//       router.replace(`/admin/books`);
//       toast({ description: "Chapter deleted." });
//     } catch (error: any) {
//       toast({
//         description:
//           "Make sure you removed all products using this chapter first.",
//         variant: "destructive",
//       });
//     } finally {
//       setLoading(false);
//       setOpen(false);
//     }
//   };

//   return (
//     <>
//       {initialData && (
//         <AlertModal
//           isOpen={open}
//           onClose={() => setOpen(false)}
//           onConfirm={onDelete}
//           loading={loading}
//         />
//       )}
//       <div className="flex items-center justify-between">
//         <Heading title={title} description={description} />
//         {initialData && (
//           <Button
//             disabled={loading}
//             variant="destructive"
//             size="sm"
//             onClick={() => setOpen(true)}
//           >
//             <Trash className="h-4 w-4" />
//           </Button>
//         )}
//       </div>
//       <Separator />
//       <Form {...form}>
//         <form
//           onSubmit={form.handleSubmit(onSubmit)}
//           className="flex flex-col gap-y-8 max-w-lg mx-auto"
//         >
//           <div className="flex flex-col items-stretch gap-y-4">
//             <FormField
//               control={form.control}
//               name="subjectId"
//               disabled={loading}
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Subject</FormLabel>
//                   <FormControl>
//                     <Select
//                       onValueChange={field.onChange}
//                       value={field.value}
//                       disabled={field.disabled}
//                       required
//                     >
//                       <SelectTrigger>
//                         <SelectValue placeholder="Select a subject" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         {subjects.map((subject) => (
//                           <SelectItem key={subject.id} value={subject.id}>
//                             {subject.name}
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />
//             <FormField
//               control={form.control}
//               name="name"
//               disabled={loading}
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Name</FormLabel>
//                   <FormControl>
//                     <Input placeholder="Book name" {...field} />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />
//             <FormField
//               control={form.control}
//               name="embed"
//               disabled={loading}
//               render={({ field: { value, onChange, ...field } }) => (
//                 <FormItem>
//                   <FormLabel>Book Cover</FormLabel>
//                   <FormControl>
//                     <DropZoneInput
//                       {...field}
//                       ref={embedRef}
//                       onFileDrop={(files) =>
//                         onChange(files.length ? files[0] : undefined)
//                       }
//                       defaultFile={value || undefined}
//                     />
//                     {/* <Input
//                       type="file"
//                       accept="image/*"
//                       placeholder="Upload a cover"
//                       {...field}
//                       onChange={(event) => {
//                         onChange(event.target.files?.[0]);
//                       }}
//                       ref={embedRef}
//                     /> */}
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />
//             <div className="grid grid-cols-2 gap-x-5">
//               <FormField
//                 control={form.control}
//                 name="edition"
//                 disabled={loading}
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Edition</FormLabel>
//                     <FormControl>
//                       <Input placeholder="Edition" {...field} />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//               <FormField<BookFormValues, "marked">
//                 control={form.control}
//                 name="marked"
//                 disabled={loading}
//                 render={({ field: { onChange, value, ...field } }) => (
//                   <FormItem>
//                     <FormLabel>Marked book</FormLabel>
//                     <FormControl>
//                       <Switch
//                         {...field}
//                         checked={value}
//                         onCheckedChange={onChange}
//                         className="block"
//                       />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//             </div>
//           </div>
//           <Button disabled={loading} className="ml-auto" type="submit">
//             {action}
//           </Button>
//         </form>
//       </Form>
//     </>
//   );
// };
