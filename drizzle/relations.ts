import { relations } from "drizzle-orm/relations";
import { chapters, posts, bookAuthors, user, institutionalInfos, postStringMaps, searchHistory, session, subjects, bookmarks, ads, adsToSubjects, account } from "./schema";

export const postsRelations = relations(posts, ({one, many}) => ({
	chapter: one(chapters, {
		fields: [posts.chapterId],
		references: [chapters.id]
	}),
	postStringMaps: many(postStringMaps),
	bookmarks: many(bookmarks),
}));

export const chaptersRelations = relations(chapters, ({one, many}) => ({
	posts: many(posts),
	bookAuthor: one(bookAuthors, {
		fields: [chapters.bookAuthorId],
		references: [bookAuthors.id]
	}),
}));

export const bookAuthorsRelations = relations(bookAuthors, ({one, many}) => ({
	chapters: many(chapters),
	subject: one(subjects, {
		fields: [bookAuthors.subjectId],
		references: [subjects.id]
	}),
}));

export const institutionalInfosRelations = relations(institutionalInfos, ({one}) => ({
	user: one(user, {
		fields: [institutionalInfos.userId],
		references: [user.id]
	}),
}));

export const userRelations = relations(user, ({many}) => ({
	institutionalInfos: many(institutionalInfos),
	searchHistories: many(searchHistory),
	sessions: many(session),
	bookmarks: many(bookmarks),
	accounts: many(account),
}));

export const postStringMapsRelations = relations(postStringMaps, ({one}) => ({
	post: one(posts, {
		fields: [postStringMaps.postId],
		references: [posts.id]
	}),
}));

export const searchHistoryRelations = relations(searchHistory, ({one}) => ({
	user: one(user, {
		fields: [searchHistory.userId],
		references: [user.id]
	}),
}));

export const sessionRelations = relations(session, ({one}) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id]
	}),
}));

export const subjectsRelations = relations(subjects, ({many}) => ({
	bookAuthors: many(bookAuthors),
	adsToSubjects: many(adsToSubjects),
}));

export const bookmarksRelations = relations(bookmarks, ({one}) => ({
	post: one(posts, {
		fields: [bookmarks.postId],
		references: [posts.id]
	}),
	user: one(user, {
		fields: [bookmarks.userId],
		references: [user.id]
	}),
}));

export const adsToSubjectsRelations = relations(adsToSubjects, ({one}) => ({
	ad: one(ads, {
		fields: [adsToSubjects.adId],
		references: [ads.id]
	}),
	subject: one(subjects, {
		fields: [adsToSubjects.subjectId],
		references: [subjects.id]
	}),
}));

export const adsRelations = relations(ads, ({many}) => ({
	adsToSubjects: many(adsToSubjects),
}));

export const accountRelations = relations(account, ({one}) => ({
	user: one(user, {
		fields: [account.userId],
		references: [user.id]
	}),
}));