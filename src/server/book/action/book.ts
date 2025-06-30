"use server";

import { InferInsertModel, InferSelectModel, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { bookAuthor } from "@/db/schema";
import db from "@/lib/db";
import { createServerAction } from "zsa";
import { createBookServerSchema } from "../schema";
import { z } from "zod";

export const createBook = createServerAction()
  .input(createBookServerSchema)
  .output(z.object({ id: z.string() }))
  .onSuccess(({ data }) => {
    revalidatePath("/admin/books");
    revalidatePath(`/admin/books/${data.id}`);
    // redirect("/admin/books");
  })
  .handler(async ({ input }) => {
    const [data] = await db
      .insert(bookAuthor)
      .values(input)
      .returning({ id: bookAuthor.id });

    return data;
  });

export async function updateBook(
  id: string,
  params: Partial<InferInsertModel<typeof bookAuthor>>
) {
  await db.update(bookAuthor).set(params).where(eq(bookAuthor.id, id));
  revalidatePath("/admin/books");
  // redirect("/admin/books");
  // return data;
}

export async function deleteBook(id: string) {
  await db.delete(bookAuthor).where(eq(bookAuthor.id, id));
  revalidatePath("/admin/books");
  // redirect("/admin/books");
}

export async function getBooksBySubject(
  _: Pick<InferSelectModel<typeof bookAuthor>, "id" | "name">[] | null,
  subjectId: string
) {
  const books = await db
    .select({
      id: bookAuthor.id,
      name: bookAuthor.name,
    })
    .from(bookAuthor)
    .where(eq(bookAuthor.subjectId, subjectId))
    .execute();

  return books;
}

export async function deleteManyBooks(_: void, ids: string[]) {
  await db.delete(bookAuthor).where(inArray(bookAuthor.id, ids));
  revalidatePath("/admin/books");
  // redirect(`/admin/books`);
}
