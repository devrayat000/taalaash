import { withCache } from "@/hooks/use-cache";
import {
	optional,
	object,
	number,
	string,
	int,
	positive,
	trim,
	type infer as Infer,
	uuid,
	boolean,
	array,
} from "zod/mini";
import { and, eq, ilike, inArray, type SQL } from "drizzle-orm";
import db from "@/lib/db";
import { bookAuthor, subject } from "@/db/schema";

// Define the return types
export type BookTable = {
	id: string;
	name: string;
	edition: string;
	marked: boolean;
	subject: {
		id: string;
		name: string;
		createdAt: Date;
	};
};

export type BookWithSubject = {
	id: string;
	name: string;
	edition: string;
	marked: boolean;
	createdAt: Date;
	subjectId: string;
	coverUrl: string | null;
	subject: {
		id: string;
		name: string;
		createdAt: Date;
	};
};

// Schemas
export const getBooksSchema = optional(
	object({
		page: optional(number().check(int()).check(positive())),
		limit: optional(number().check(int()).check(positive())),
		query: optional(string().check(trim())),
	}),
);

export const getBookByIdSchema = object({
	id: uuid(),
});

export const getFilteredBooksSchema = object({
	books: optional(array(uuid())),
	marked: optional(boolean()),
	editions: optional(array(string().check(trim()))),
	subjects: optional(array(uuid())),
	page: optional(number().check(int()).check(positive())),
	limit: optional(number().check(int()).check(positive())),
	query: optional(string().check(trim())),
	orderBy: optional(array(string())),
});

// Service functions
export const getBooks = withCache(
	async (params: Infer<typeof getBooksSchema>) => {
		const page = params?.page || 1;
		const limit = params?.limit || 10;
		const query = params?.query;

		// Build the base query
		let queryBuilder = db
			.select({
				id: bookAuthor.id,
				name: bookAuthor.name,
				edition: bookAuthor.edition,
				marked: bookAuthor.marked,
				subject: {
					id: subject.id,
					name: subject.name,
					createdAt: subject.createdAt,
				},
			})
			.from(bookAuthor)
			.innerJoin(subject, eq(bookAuthor.subjectId, subject.id))
			.$dynamic();

		// Apply search filter if provided
		if (query) {
			queryBuilder = queryBuilder.where(ilike(bookAuthor.name, `%${query}%`));
		}

		// Apply pagination
		const results = await queryBuilder
			.offset((page - 1) * limit)
			.limit(limit)
			.execute();

		return results;
	},
	{
		tags: (params) => [
			"books",
			...(params?.query ? [`book-search:${params.query}`] : []),
		],
		ttl: 300, // 5 minutes
	},
);

export const getBookById = withCache(
	async ({
		id,
	}: Infer<typeof getBookByIdSchema>): Promise<BookWithSubject | null> => {
		const book = await db
			.select({
				id: bookAuthor.id,
				name: bookAuthor.name,
				edition: bookAuthor.edition,
				marked: bookAuthor.marked,
				createdAt: bookAuthor.createdAt,
				subjectId: bookAuthor.subjectId,
				coverUrl: bookAuthor.coverUrl,
				subject: {
					id: subject.id,
					name: subject.name,
					createdAt: subject.createdAt,
				},
			})
			.from(bookAuthor)
			.innerJoin(subject, eq(bookAuthor.subjectId, subject.id))
			.where(eq(bookAuthor.id, id))
			.limit(1)
			.execute();

		return book[0] || null;
	},
	{
		prefix: "book",
		tags: (params) => [`book:${params.id}`],
		ttl: 3600, // 1 hour
	},
);

export const getFilteredBooks = withCache(
	async (params: Infer<typeof getFilteredBooksSchema>) => {
		// Build the base query with $dynamic() to allow chaining
		let queryBuilder = db
			.select({
				id: bookAuthor.id,
				name: bookAuthor.name,
				edition: bookAuthor.edition,
				marked: bookAuthor.marked,
				createdAt: bookAuthor.createdAt,
				subjectId: bookAuthor.subjectId,
				coverUrl: bookAuthor.coverUrl,
				subject: {
					id: subject.id,
					name: subject.name,
					createdAt: subject.createdAt,
				},
			})
			.from(bookAuthor)
			.innerJoin(subject, eq(bookAuthor.subjectId, subject.id))
			.$dynamic();

		// Build conditions array
		const conditions: (SQL<unknown> | undefined)[] = [];

		if (!!params?.books?.length) {
			if (params.books.length > 1) {
				conditions.push(inArray(bookAuthor.id, params.books));
			} else {
				conditions.push(eq(bookAuthor.id, params.books[0]));
			}
		}

		if (!!params?.subjects?.length) {
			if (params.subjects.length > 1) {
				conditions.push(inArray(bookAuthor.subjectId, params.subjects));
			} else {
				conditions.push(eq(bookAuthor.subjectId, params.subjects[0]));
			}
		}

		if (!!params?.editions?.length) {
			if (params.editions.length > 1) {
				conditions.push(inArray(bookAuthor.edition, params.editions));
			} else {
				conditions.push(eq(bookAuthor.edition, params.editions[0]));
			}
		}

		if (params?.marked !== undefined) {
			conditions.push(eq(bookAuthor.marked, params.marked));
		}

		if (params?.query) {
			conditions.push(ilike(bookAuthor.name, `%${params?.query}%`));
		}

		// Apply conditions
		if (conditions.length > 0) {
			if (conditions.length > 1) {
				queryBuilder = queryBuilder.where(and(...conditions));
			} else {
				queryBuilder = queryBuilder.where(conditions[0]);
			}
		}

		// Apply ordering
		if (params?.orderBy?.length) {
			const orderColumns = params.orderBy.map((col) => {
				if (col === "name") return bookAuthor.name;
				if (col === "createdAt") return bookAuthor.createdAt;
				if (col === "edition") return bookAuthor.edition;
				return bookAuthor.createdAt; // default
			});
			queryBuilder = queryBuilder.orderBy(...orderColumns);
		}

		// Apply pagination
		if (params?.page && params.limit) {
			queryBuilder = queryBuilder.offset((params.page - 1) * params.limit);
		}
		if (params?.limit) {
			queryBuilder = queryBuilder.limit(params.limit);
		}

		return queryBuilder.execute();
	},
	{
		tags: (params) => [
			"books",
			"filtered-books",
			...(params?.subjects?.length
				? params.subjects.map((s) => `subject:${s}`)
				: []),
			...(params?.query ? [`book-search:${params.query}`] : []),
		],
		ttl: 300, // 5 minutes
	},
);
