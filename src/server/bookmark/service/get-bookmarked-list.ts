import { createServerFn } from "@tanstack/react-start";
import { desc, eq } from "drizzle-orm";
import { bookmark } from "@/db/schema";
import { auth } from "@/lib/auth";
import db from "@/lib/db";
import { redirect } from "@tanstack/react-router";

export const getBookmarkedList = createServerFn({ method: "GET" }).handler(
  async () => {
    const session = await auth();
    if (!session) {
      throw redirect({ to: "/signin" });
    }

    const bookmarked = await db
      .select({
        postId: bookmark.postId,
      })
      .from(bookmark)
      .where(eq(bookmark.userId, session.user.id))
      .orderBy(desc(bookmark.createdAt));

    return bookmarked;
  }
);

export type BookmarkedList = Awaited<ReturnType<typeof getBookmarkedList>>;
