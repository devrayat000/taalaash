ALTER TABLE "account" ALTER COLUMN "refreshTokenExpiresAt" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "account" ALTER COLUMN "idToken" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "account" ALTER COLUMN "password" SET DEFAULT '';