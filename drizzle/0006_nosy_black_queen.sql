ALTER TABLE "book_authors" RENAME COLUMN "embed_url" TO "cover_url";--> statement-breakpoint
ALTER TABLE "book_authors" DROP CONSTRAINT "book_authors_name_unique";--> statement-breakpoint
ALTER TABLE "book_authors" DROP CONSTRAINT "uniqueAuthor";--> statement-breakpoint
ALTER TABLE "book_authors" ADD COLUMN "marked" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "book_authors" ADD CONSTRAINT "uniqueBook" UNIQUE("name","edition","marked","subject_id");