// import { DrizzleAdapter } from "@auth/drizzle-adapter";
// import { AuthOptions, getServerSession } from "next-auth";
// import GoogleProvider from "next-auth/providers/google";
// import CredentialsProvider from "next-auth/providers/credentials";

// import db from "./db";
// import { env } from "./utils";
// import { redirect } from "next/navigation";

// const adminAuthStore = [
//   {
//     id: "1",
//     username: "Teamtaalaash",
//     password: "taalaash@2024",
//   },
//   {
//     id: "2",
//     username: "admin_1",
//     password: "taalaash_admin_1",
//   },
//   {
//     id: "3",
//     username: "admin_2",
//     password: "taalaash_admin_2",
//   },
//   {
//     id: "4",
//     username: "admin_3",
//     password: "taalaash_admin_3",
//   },
// ];

// export const authOptions: AuthOptions = {
//   // @ts-ignore
//   adapter: DrizzleAdapter(db),
//   // Configure one or more authentication providers
//   providers: [
//     GoogleProvider({
//       clientId: env("GOOGLE_CLIENT_ID")!,
//       clientSecret: env("GOOGLE_CLIENT_SECRET")!,
//     }),
//     CredentialsProvider({
//       id: "admin",
//       name: "Admin",
//       credentials: {
//         username: { label: "Username", type: "text" },
//         password: { label: "Password", type: "password" },
//       },
//       async authorize(credentials) {
//         const user = adminAuthStore.find(
//           (user) => user.username === credentials?.username
//         );
//         if (!user) {
//           return null;
//         }

//         if (user.password !== credentials?.password) {
//           throw new Error("Invalid password");
//         }

//         return { ...user, type: "admin" };
//       },
//     }),
//     // ...add more providers here
//   ],
//   session: { strategy: "jwt" },
//   callbacks: {
//     jwt({ token, account, user }) {
//       if (account) {
//         token.accessToken = account.access_token;
//         token.sub = user?.id;
//       }

//       if (!!user && "type" in user) {
//         token.type = user.type;
//       } else {
//         token.type = "user";
//       }

//       return token;
//     },
//     session({ session, token, user }) {
//       // I skipped the line below coz it gave me a TypeError
//       // session.accessToken = token.accessToken;
//       session.user.id = token?.sub || user.id;
//       // @ts-ignore
//       session.user.type = token?.type || "user";
//       // console.log(session);

//       return session;
//     },
//   },
//   pages: {
//     signIn: "/signin",
//     error: "/signin",
//     newUser: "/init",
//   },
// };

// export async function auth() {
//   return getServerSession(authOptions);
// }

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { reactStartCookies } from "better-auth/react-start";
import { admin } from "better-auth/plugins";
import db from "./db";
import * as schema from "@/db/schema";
import redis from "./redis";

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: "pg", // or "pg" or "mysql"
		schema: {
			user: schema.users,
			session: schema.sessions,
			account: schema.accounts,
			verification: schema.verifications,
		}, // your Drizzle schema
	}),
	emailAndPassword: {
		enabled: true,
		autoSignIn: true,
		requireEmailVerification: false,
	},
	plugins: [reactStartCookies(), admin()],
	socialProviders: {
		google: {
			clientId: process.env.VITE_GOOGLE_CLIENT_ID!,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
		},
	},
	session: {
		cookieCache: {
			enabled: true,
			maxAge: 60 * 60,
		},
	},
	secondaryStorage: {
		get: (key) => redis.get(key),
		set: (key, value, ttl) => redis.set(key, value, { EX: ttl }),
		delete: (key) => void redis.del(key),
	},
	//... the rest of your config
});

// export async function requireAuth(callbackUrl = "/signin") {
//   const session = await auth();
//   if (!session) {
//     redirect(callbackUrl);
//   }
//   return session;
// }
