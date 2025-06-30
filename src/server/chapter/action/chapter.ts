"use server";

import { chapter } from "@/db/schema";
import db from "@/lib/db";
import { InferSelectModel, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function createChapter(params: {
  name: string;
  bookAuthorId: string;
}) {
  const [data] = await db
    .insert(chapter)
    .values(params)
    .returning({ id: chapter.id });
  revalidatePath("/admin/chapters");
  // redirect("/admin/chapters");
  return data;
}

export async function updateChapter(
  id: string,
  params: Partial<{ name: string; bookAuthorId: string }>
) {
  await db.update(chapter).set(params).where(eq(chapter.id, id));
  revalidatePath("/admin/chapters");
  // redirect("/admin/chapters");
  // return data;
}

export async function deleteChapter(id: string) {
  await db.delete(chapter).where(eq(chapter.id, id));
  revalidatePath("/admin/chapters");
  // redirect("/admin/chapters");
}

export async function getChaptersByBooks(
  _: InferSelectModel<typeof chapter>[] | null,
  bookAuthorId: string
) {
  const chapters = await db
    .select({
      id: chapter.id,
      name: chapter.name,
    })
    .from(chapter)
    .where(eq(chapter.bookAuthorId, bookAuthorId))
    .execute();

  return chapters;
}

export async function deleteManyChapters(_: void, ids: string[]) {
  await db.delete(chapter).where(inArray(chapter.id, ids));
  revalidatePath("/admin/chapters");
  // redirect(`/admin/chapters`);
}
