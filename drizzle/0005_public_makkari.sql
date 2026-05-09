CREATE TABLE IF NOT EXISTS "gym_urls" (
	"id" serial PRIMARY KEY NOT NULL,
	"gym_id" integer NOT NULL,
	"url" text NOT NULL,
	"label" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "gym_urls" ADD CONSTRAINT "gym_urls_gym_id_gyms_id_fk" FOREIGN KEY ("gym_id") REFERENCES "public"."gyms"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_gym_urls_gym" ON "gym_urls" USING btree ("gym_id");