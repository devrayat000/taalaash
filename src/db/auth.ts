import { timestamp, pgTable, text, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { bookmark } from "./schema";

// User table
export const users = pgTable("user", {
  id: text("id").notNull().primaryKey(),
  name: text("name"),
  email: text("email").notNull(),
  emailVerified: boolean("emailVerified").notNull().default(false),
  image: text("image"),
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

export const userRelations = relations(users, ({ many }) => ({
  bookmarks: many(bookmark),
  sessions: many(sessions),
  accounts: many(accounts),
}));

// Session table
export const sessions = pgTable("session", {
  id: text("id").notNull().primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expiresAt", { mode: "date" }).notNull(),
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

export const sessionRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

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

export const accountRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));

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

// Keep institutional info if still needed
export const institutionalInfo = pgTable("institutional_infos", {
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" })
    .primaryKey(),
  hscYear: text("hscYear").notNull(),
  college: text("college").notNull(),
});
