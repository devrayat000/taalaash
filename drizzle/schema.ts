import { pgTable, unique, uuid, text, timestamp, foreignKey, integer, boolean, primaryKey } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const ads = pgTable("ads", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	title: text().notNull(),
	description: text(),
	link: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	imageUrl: text("image_url").notNull(),
	classes: text().array(),
}, (table) => [
	unique("ads_link_unique").on(table.link),
]);

export const subjects = pgTable("subjects", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("subjects_name_unique").on(table.name),
]);

export const posts = pgTable("posts", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	text: text().notNull(),
	chapterId: uuid("chapter_id").notNull(),
	page: integer(),
	imageUrl: text("image_url").notNull(),
	keywords: text().array(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.chapterId],
			foreignColumns: [chapters.id],
			name: "posts_chapter_id_chapters_id_fk"
		}).onDelete("cascade"),
]);

export const chapters = pgTable("chapters", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: text().notNull(),
	bookAuthorId: uuid("book_author_id").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.bookAuthorId],
			foreignColumns: [bookAuthors.id],
			name: "chapters_book_author_id_book_authors_id_fk"
		}).onDelete("cascade"),
	unique("uniqueChapter").on(table.name, table.bookAuthorId),
]);

export const institutionalInfos = pgTable("institutional_infos", {
	userId: text().primaryKey().notNull(),
	hscYear: text().notNull(),
	college: text().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "institutional_infos_userId_user_id_fk"
		}).onDelete("cascade"),
]);

export const postStringMaps = pgTable("post_string_maps", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	text: text(),
	left: integer(),
	top: integer(),
	width: integer(),
	height: integer(),
	postId: uuid("post_id"),
}, (table) => [
	foreignKey({
			columns: [table.postId],
			foreignColumns: [posts.id],
			name: "post_string_maps_post_id_fkey"
		}),
]);

export const searchHistory = pgTable("search_history", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	query: text().notNull(),
	userId: text("user_id").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "search_history_user_id_user_id_fk"
		}).onDelete("cascade"),
]);

export const session = pgTable("session", {
	sessionToken: text().primaryKey().notNull(),
	userId: text().notNull(),
	expires: timestamp({ mode: 'string' }).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "session_userId_user_id_fk"
		}).onDelete("cascade"),
]);

export const bookAuthors = pgTable("book_authors", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: text().notNull(),
	subjectId: uuid("subject_id").notNull(),
	coverUrl: text("cover_url"),
	edition: text().default('2024').notNull(),
	marked: boolean().default(false).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.subjectId],
			foreignColumns: [subjects.id],
			name: "book_authors_subject_id_subjects_id_fk"
		}).onDelete("cascade"),
	unique("uniqueBook").on(table.name, table.subjectId, table.edition, table.marked),
]);

export const user = pgTable("user", {
	id: text().primaryKey().notNull(),
	name: text(),
	email: text().notNull(),
	emailVerified: timestamp({ mode: 'string' }),
	image: text(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("user_email_unique").on(table.email),
]);

export const bookmarks = pgTable("bookmarks", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	postId: uuid("post_id").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.postId],
			foreignColumns: [posts.id],
			name: "bookmarks_post_id_posts_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "bookmarks_user_id_user_id_fk"
		}).onDelete("cascade"),
]);

export const adsToSubjects = pgTable("ads_to_subjects", {
	adId: uuid("ad_id").notNull(),
	subjectId: uuid("subject_id").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.adId],
			foreignColumns: [ads.id],
			name: "ads_to_subjects_ad_id_ads_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.subjectId],
			foreignColumns: [subjects.id],
			name: "ads_to_subjects_subject_id_subjects_id_fk"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.adId, table.subjectId], name: "ad_subject_pk"}),
]);

export const verificationToken = pgTable("verificationToken", {
	identifier: text().notNull(),
	token: text().notNull(),
	expires: timestamp({ mode: 'string' }).notNull(),
}, (table) => [
	primaryKey({ columns: [table.identifier, table.token], name: "verificationToken_identifier_token_pk"}),
]);

export const account = pgTable("account", {
	userId: text().notNull(),
	type: text().notNull(),
	provider: text().notNull(),
	providerAccountId: text().notNull(),
	refreshToken: text("refresh_token"),
	accessToken: text("access_token"),
	expiresAt: integer("expires_at"),
	tokenType: text("token_type"),
	scope: text(),
	idToken: text("id_token"),
	sessionState: text("session_state"),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "account_userId_user_id_fk"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.provider, table.providerAccountId], name: "account_provider_providerAccountId_pk"}),
]);
