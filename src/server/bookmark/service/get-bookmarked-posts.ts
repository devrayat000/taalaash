import { createServerFn } from "@tanstack/react-start";
import { string } from "valibot";
import { desc, eq, sql } from "drizzle-orm";

import {
  accounts,
  bookAuthor,
  bookmark,
  chapter,
  post,
  subject,
} from "@/db/schema";
import db from "@/lib/db";
import { authed } from "@/server/middleware";

const bookmarkedPostStatement = db
  .select({
    objectID: post.id,
    imageUrl: post.imageUrl,
    chapter: {
      name: chapter.name,
    },
    subject: {
      name: subject.name,
    },
    book: {
      name: bookAuthor.name,
      edition: bookAuthor.edition,
    },
  })
  .from(bookmark)
  .innerJoin(post, eq(bookmark.postId, post.id))
  .innerJoin(chapter, eq(chapter.id, post.chapterId))
  .innerJoin(bookAuthor, eq(bookAuthor.id, chapter.bookAuthorId))
  .innerJoin(subject, eq(subject.id, bookAuthor.subjectId))
  .where(eq(bookmark.userId, sql.placeholder("userId")))
  .orderBy(desc(bookmark.createdAt))
  .prepare("get_bookmarked_posts_statement");

export const getBookmarkedPosts = createServerFn({ method: "GET" })
  .middleware([authed])
  .handler(async ({ context }) => {
    const bookmarked = await bookmarkedPostStatement.execute({
      userId: context.user.id,
    });
    return bookmarked;
  });

export type BookmarkedPosts = Awaited<ReturnType<typeof getBookmarkedPosts>>;

const bookmarkedPostByProviderIdStatement = db
  .select({
    objectID: post.id,
    imageUrl: post.imageUrl,
    chapter: {
      name: chapter.name,
    },
    subject: {
      name: subject.name,
    },
    book: {
      name: bookAuthor.name,
      edition: bookAuthor.edition,
    },
  })
  .from(bookmark)
  .innerJoin(post, eq(bookmark.postId, post.id))
  .innerJoin(chapter, eq(chapter.id, post.chapterId))
  .innerJoin(bookAuthor, eq(bookAuthor.id, chapter.bookAuthorId))
  .innerJoin(subject, eq(subject.id, bookAuthor.subjectId))
  .innerJoin(accounts, eq(bookmark.userId, accounts.userId))
  .where(eq(accounts.accountId, sql.placeholder("userId")))
  .orderBy(desc(bookmark.createdAt))
  .prepare("get_bookmarked_posts_statement");

export const getBookmarkedPostsByProviderId = createServerFn({ method: "GET" })
  .validator(string())
  .handler(async ({ data: userId }) => {
    const bookmarked = await bookmarkedPostByProviderIdStatement.execute({
      userId,
    });
    return bookmarked;
  });

export type BookmarkedPostsByProviderId = Awaited<
  ReturnType<typeof getBookmarkedPostsByProviderId>
>;
