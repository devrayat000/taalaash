ALTER TABLE "verificationToken" RENAME TO "verification";--> statement-breakpoint
ALTER TABLE "account" RENAME COLUMN "providerAccountId" TO "accountId";--> statement-breakpoint
ALTER TABLE "account" RENAME COLUMN "provider" TO "providerId";--> statement-breakpoint
ALTER TABLE "account" RENAME COLUMN "access_token" TO "accessToken";--> statement-breakpoint
ALTER TABLE "account" RENAME COLUMN "refresh_token" TO "refreshToken";--> statement-breakpoint
ALTER TABLE "account" RENAME COLUMN "expires_at" TO "accessTokenExpiresAt";--> statement-breakpoint
ALTER TABLE "account" RENAME COLUMN "id_token" TO "idToken";--> statement-breakpoint
ALTER TABLE "session" RENAME COLUMN "sessionToken" TO "id";--> statement-breakpoint
ALTER TABLE "session" RENAME COLUMN "expires" TO "expiresAt";--> statement-breakpoint
ALTER TABLE "user" RENAME COLUMN "created_at" TO "createdAt";--> statement-breakpoint
ALTER TABLE "verification" RENAME COLUMN "token" TO "value";--> statement-breakpoint
ALTER TABLE "verification" RENAME COLUMN "expires" TO "expiresAt";--> statement-breakpoint
ALTER TABLE "account" DROP CONSTRAINT "account_provider_providerAccountId_pk";--> statement-breakpoint
ALTER TABLE "institutional_infos" DROP CONSTRAINT "institutional_infos_userId_pk";--> statement-breakpoint
ALTER TABLE "verification" DROP CONSTRAINT "verificationToken_identifier_token_pk";--> statement-breakpoint
ALTER TABLE "institutional_infos" ADD PRIMARY KEY ("userId");--> statement-breakpoint
ALTER TABLE "account" ADD COLUMN "id" text PRIMARY KEY NOT NULL;--> statement-breakpoint
ALTER TABLE "account" ADD COLUMN "refreshTokenExpiresAt" timestamp;--> statement-breakpoint
ALTER TABLE "account" ADD COLUMN "password" text;--> statement-breakpoint
ALTER TABLE "account" ADD COLUMN "createdAt" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "account" ADD COLUMN "updatedAt" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "session" ADD COLUMN "token" text NOT NULL;--> statement-breakpoint
ALTER TABLE "session" ADD COLUMN "ipAddress" text;--> statement-breakpoint
ALTER TABLE "session" ADD COLUMN "userAgent" text;--> statement-breakpoint
ALTER TABLE "session" ADD COLUMN "createdAt" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "session" ADD COLUMN "updatedAt" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "updatedAt" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "verification" ADD COLUMN "id" text PRIMARY KEY NOT NULL;--> statement-breakpoint
ALTER TABLE "verification" ADD COLUMN "createdAt" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "verification" ADD COLUMN "updatedAt" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "account" DROP COLUMN "type";--> statement-breakpoint
ALTER TABLE "account" DROP COLUMN "token_type";--> statement-breakpoint
ALTER TABLE "account" DROP COLUMN "session_state";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "emailVerified";--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_token_unique" UNIQUE("token");