ALTER TABLE "posts" DROP CONSTRAINT "posts_tag_id_tags_id_fk";
ALTER TABLE "posts" DROP COLUMN IF EXISTS "tag_id";
--> statement-breakpoint
DROP TABLE "tags";
--> statement-breakpoint
--> statement-breakpoint
ALTER TABLE "posts"
ADD COLUMN "chapter_id" uuid NOT NULL;
--> statement-breakpoint
ALTER TABLE "posts"
ADD COLUMN "page" integer NOT NULL;
--> statement-breakpoint
ALTER TABLE "posts"
ADD COLUMN "image_url" text;
--> statement-breakpoint
ALTER TABLE "posts"
ADD COLUMN "keywords" text [];
--> statement-breakpoint
DO $$ BEGIN
ALTER TABLE "posts"
ADD CONSTRAINT "posts_chapter_id_chapters_id_fk" FOREIGN KEY ("chapter_id") REFERENCES "chapters"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "book_authors"
ADD CONSTRAINT "uniqueAuthor" UNIQUE("name", "subject_id");
--> statement-breakpoint
ALTER TABLE "chapters"
ADD CONSTRAINT "uniqueChapter" UNIQUE("name", "book_author_id");