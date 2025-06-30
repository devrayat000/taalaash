ALTER TABLE "session" ADD COLUMN "impersonatedBy" text DEFAULT '';--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "role" text DEFAULT 'user';--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "banned" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "banReason" text DEFAULT '';--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "banExpires" timestamp with time zone DEFAULT now();