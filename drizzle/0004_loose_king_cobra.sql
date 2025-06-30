CREATE TABLE IF NOT EXISTS "institutional_infos" (
	"userId" text NOT NULL,
	"hscYear" text NOT NULL,
	"college" text NOT NULL,
	CONSTRAINT "institutional_infos_userId_pk" PRIMARY KEY("userId")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "institutional_infos" ADD CONSTRAINT "institutional_infos_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
