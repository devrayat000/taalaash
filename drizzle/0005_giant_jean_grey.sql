ALTER TABLE "posts" ALTER COLUMN "page" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "posts" ALTER COLUMN "image_url" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "book_authors" ADD COLUMN "edition" text DEFAULT '2024' NOT NULL;