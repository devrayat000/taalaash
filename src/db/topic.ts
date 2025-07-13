import {
	text,
	integer,
	pgTable,
	uuid,
	unique,
	timestamp,
	boolean,
} from "drizzle-orm/pg-core";
import { users } from "./auth";

export const subject = pgTable("subjects", {
	id: uuid("id").primaryKey().defaultRandom(),
	name: text("name").notNull().unique(),
	createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const bookAuthor = pgTable(
	"book_authors",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		name: text("name").notNull(),
		edition: text("edition").notNull().default("2024"),
		marked: boolean("marked").notNull().default(false),
		coverUrl: text("cover_url"),
		subjectId: uuid("subject_id")
			.notNull()
			.references(() => subject.id, { onDelete: "cascade" }),
		createdAt: timestamp("created_at").notNull().defaultNow(),
	},
	(table) => ({
		uniqueBook: unique("uniqueBook").on(
			table.name,
			table.edition,
			table.marked,
			table.subjectId,
		),
	}),
);

export const chapter = pgTable(
	"chapters",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		name: text("name").notNull(),
		bookAuthorId: uuid("book_author_id")
			.notNull()
			.references(() => bookAuthor.id, { onDelete: "cascade" }),
		createdAt: timestamp("created_at").notNull().defaultNow(),
	},
	(table) => ({
		uniqueChapter: unique("uniqueChapter").on(table.name, table.bookAuthorId),
	}),
);

export const post = pgTable("posts", {
	id: uuid("id").primaryKey().defaultRandom(),
	page: integer("page"),
	chapterId: uuid("chapter_id")
		.notNull()
		.references(() => chapter.id, { onDelete: "cascade" }),
	imageUrl: text("image_url").notNull(),
	keywords: text("keywords").array(),
	createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const searchHistory = pgTable("search_history", {
	id: uuid("id").primaryKey().defaultRandom(),
	query: text("query").notNull(),
	userId: text("user_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const bookmark = pgTable("bookmarks", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: text("user_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	postId: uuid("post_id")
		.notNull()
		.references(() => post.id, { onDelete: "cascade" }),
	createdAt: timestamp("created_at").notNull().defaultNow(),
});
