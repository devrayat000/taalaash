import { Lucia, TimeSpan } from "lucia";
import { DrizzlePostgreSQLAdapter } from "@lucia-auth/adapter-drizzle";
import { Google } from "arctic";

import db from "./db";
import { users, sessions } from "@/db/auth";
import { webcrypto } from "node:crypto";

globalThis.crypto = webcrypto as Crypto;

const adapter = new DrizzlePostgreSQLAdapter(db, sessions, users);

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    attributes: {
      // set to `true` when using HTTPS
      secure: process.env.NODE_ENV === "production",
    },
    expires: true,
  },
  sessionExpiresIn: new TimeSpan(2, "w"),
  getUserAttributes(databaseUserAttributes) {
    console.log("attrs", databaseUserAttributes);
    return databaseUserAttributes;
  },
});

export const google = new Google(
  process.env.GOOGLE_CLIENT_ID!,
  process.env.GOOGLE_CLIENT_SECRET!,
  "http://localhost:3000/auth/login/google/callback"
);

// IMPORTANT!
declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
  }
}
