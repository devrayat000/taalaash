"use server";

import { redirect } from "next/navigation";

import { bookmark } from "@/db/schema";
import db from "@/lib/db";
import { auth } from "@/lib/auth";
import { and, eq } from "drizzle-orm";

export async function toggleBookmark(initial: boolean, postId: string) {
  const session = await auth();
  if (!session) {
    redirect("/signin");
  }

  // const bookmarked = await db.transaction(async (tx) => {
  //   const prevRecords = await tx
  //     .select({ id: bookmark.id })
  //     .from(bookmark)
  //     .where(
  //       and(eq(bookmark.postId, postId), eq(bookmark.userId, session.user.id))
  //     )
  //     .limit(1);

  if (initial) {
    await db
      .delete(bookmark)
      .where(
        and(eq(bookmark.postId, postId), eq(bookmark.userId, session.user.id))
      );
    return false;
  } else {
    await db
      .insert(bookmark)
      .values({ postId, userId: session.user.id })
      .returning();
    return true;
  }
  // });

  // return bookmarked;
}
