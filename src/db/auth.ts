import { timestamp, pgTable, text, boolean } from "drizzle-orm/pg-core";

// User table
export const users = pgTable("user", {
	id: text("id").notNull().primaryKey(),
	name: text("name"),
	email: text("email").notNull(),
	emailVerified: boolean("emailVerified").notNull().default(false),
	image: text("image"),
	role: text("role").default("user"),
	banned: boolean("banned").default(false),
	banReadon: text("banReason").default(""),
	banExpires: timestamp("banExpires", {
		mode: "date",
		withTimezone: true,
	}).defaultNow(),
	createdAt: timestamp("createdAt", {
		mode: "date",
		withTimezone: true,
	})
		.notNull()
		.defaultNow(),
	updatedAt: timestamp("updatedAt", {
		mode: "date",
		withTimezone: true,
	})
		.notNull()
		.defaultNow(),
});

// Session table
export const sessions = pgTable("session", {
	id: text("id").notNull().primaryKey(),
	userId: text("userId")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	token: text("token").notNull().unique(),
	expiresAt: timestamp("expiresAt", { mode: "date" }).notNull(),
	impersonatedBy: text("impersonatedBy").default(""),
	ipAddress: text("ipAddress"),
	userAgent: text("userAgent"),
	createdAt: timestamp("createdAt", {
		mode: "date",
		withTimezone: true,
	})
		.notNull()
		.defaultNow(),
	updatedAt: timestamp("updatedAt", {
		mode: "date",
		withTimezone: true,
	})
		.notNull()
		.defaultNow(),
});

// Account table
export const accounts = pgTable("account", {
	id: text("id").notNull().primaryKey(),
	userId: text("userId")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	accountId: text("accountId").notNull(),
	providerId: text("providerId").notNull(),
	accessToken: text("accessToken"),
	refreshToken: text("refreshToken"),
	accessTokenExpiresAt: timestamp("accessTokenExpiresAt", {
		mode: "date",
		withTimezone: true,
	}),
	refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt", {
		mode: "date",
		withTimezone: true,
	}).defaultNow(),
	scope: text("scope"),
	idToken: text("idToken").default(""),
	password: text("password").default(""),
	createdAt: timestamp("createdAt", {
		mode: "date",
		withTimezone: true,
	})
		.notNull()
		.defaultNow(),
	updatedAt: timestamp("updatedAt", {
		mode: "date",
		withTimezone: true,
	})
		.notNull()
		.defaultNow(),
});

// Verification table
export const verifications = pgTable("verification", {
	id: text("id").notNull().primaryKey(),
	identifier: text("identifier").notNull(),
	value: text("value").notNull(),
	expiresAt: timestamp("expiresAt", { mode: "date" }).notNull(),
	createdAt: timestamp("createdAt", {
		mode: "date",
		withTimezone: true,
	})
		.notNull()
		.defaultNow(),
	updatedAt: timestamp("updatedAt", {
		mode: "date",
		withTimezone: true,
	})
		.notNull()
		.defaultNow(),
});

// Institutional info table
export const institutionalInfo = pgTable("institutional_infos", {
	userId: text("userId")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" })
		.primaryKey(),
	hscYear: text("hscYear").notNull(),
	college: text("college").notNull(),
});
