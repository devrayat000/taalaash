import { users, sessions, accounts } from "./auth";
import { subject, bookAuthor, chapter, post, bookmark } from "./topic";
import { relations } from "drizzle-orm";

export * from "./auth";
export * from "./topic";

export const subjectRelations = relations(subject, ({ many }) => ({
	books: many(bookAuthor),
}));

export const bookAuthorRelations = relations(bookAuthor, ({ one, many }) => ({
	subject: one(subject, {
		fields: [bookAuthor.subjectId],
		references: [subject.id],
	}),
	chapters: many(chapter),
}));

export const chapterRelations = relations(chapter, ({ one, many }) => ({
	book: one(bookAuthor, {
		fields: [chapter.bookAuthorId],
		references: [bookAuthor.id],
	}),
	posts: many(post),
}));

export const postRelations = relations(post, ({ one }) => ({
	chapter: one(chapter, {
		fields: [post.chapterId],
		references: [chapter.id],
	}),
}));

export const bookmarkRelations = relations(bookmark, ({ one }) => ({
	user: one(users, {
		fields: [bookmark.userId],
		references: [users.id],
	}),
	post: one(post, {
		fields: [bookmark.postId],
		references: [post.id],
	}),
}));

// Define all relations AFTER all table declarations
export const userRelations = relations(users, ({ many }) => ({
	bookmarks: many(bookmark),
	sessions: many(sessions),
	accounts: many(accounts),
}));

export const sessionRelations = relations(sessions, ({ one }) => ({
	user: one(users, {
		fields: [sessions.userId],
		references: [users.id],
	}),
}));

export const accountRelations = relations(accounts, ({ one }) => ({
	user: one(users, {
		fields: [accounts.userId],
		references: [users.id],
	}),
}));
