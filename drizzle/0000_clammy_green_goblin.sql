CREATE TYPE "public"."gym_status" AS ENUM('active', 'inactive', 'pending_review', 'closed');--> statement-breakpoint
CREATE TYPE "public"."price_type" AS ENUM('matricula', 'monthly', 'annual_maintenance', 'penalty', 'additional');--> statement-breakpoint
CREATE TYPE "public"."review_sentiment" AS ENUM('positive', 'negative', 'neutral');--> statement-breakpoint
CREATE TYPE "public"."scraper_source" AS ENUM('direct_web', 'google_maps', 'browserless', 'scrapingbee', 'manual');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "alerts" (
	"id" serial PRIMARY KEY NOT NULL,
	"gym_id" integer NOT NULL,
	"type" varchar(50) NOT NULL,
	"severity" varchar(20) DEFAULT 'info',
	"message" text NOT NULL,
	"metadata" jsonb,
	"resolved" boolean DEFAULT false,
	"resolved_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "chains" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"logo_url" text,
	"website" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "chains_name_unique" UNIQUE("name"),
	CONSTRAINT "chains_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "cities" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"province" varchar(100),
	"region" varchar(100) DEFAULT 'Cataluña',
	"slug" varchar(255) NOT NULL,
	"postal_codes" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "cities_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "facilities" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"category" varchar(100),
	"icon" varchar(50),
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "facilities_name_unique" UNIQUE("name"),
	CONSTRAINT "facilities_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "gym_facilities" (
	"gym_id" integer NOT NULL,
	"facility_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "gyms" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(500) NOT NULL,
	"slug" varchar(500) NOT NULL,
	"address" text,
	"city_id" integer,
	"neighborhood_id" integer,
	"coordinates" geometry(Point, 4326),
	"google_place_id" varchar(255),
	"chain_id" integer,
	"monthly_price_low" numeric(10, 2),
	"monthly_price_high" numeric(10, 2),
	"matricula_fee" numeric(10, 2),
	"annual_maintenance_fee" numeric(10, 2),
	"is_open_247" boolean DEFAULT false,
	"opening_hours" jsonb,
	"phone" varchar(50),
	"website" text,
	"booking_url" text,
	"description" text,
	"short_description" text,
	"meta_title" varchar(200),
	"meta_description" text,
	"ai_summary_pros" jsonb DEFAULT '[]'::jsonb,
	"ai_summary_cons" jsonb DEFAULT '[]'::jsonb,
	"ai_summary_updated_at" timestamp,
	"embedding" vector(256),
	"status" "gym_status" DEFAULT 'pending_review',
	"data_source" "scraper_source" DEFAULT 'manual',
	"source_url" text,
	"last_scraped_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "gyms_slug_unique" UNIQUE("slug"),
	CONSTRAINT "gyms_google_place_id_unique" UNIQUE("google_place_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "neighborhoods" (
	"id" serial PRIMARY KEY NOT NULL,
	"city_id" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "prices_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"gym_id" integer NOT NULL,
	"price_type" "price_type" NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"currency" varchar(3) DEFAULT 'EUR',
	"label" varchar(255),
	"conditions" text,
	"source" "scraper_source" DEFAULT 'direct_web',
	"valid_from" timestamp NOT NULL,
	"valid_to" timestamp,
	"recorded_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "reviews_summary" (
	"id" serial PRIMARY KEY NOT NULL,
	"gym_id" integer NOT NULL,
	"source" varchar(50) DEFAULT 'google_maps',
	"rating" numeric(3, 2),
	"review_count" integer DEFAULT 0,
	"top_pros" jsonb DEFAULT '[]'::jsonb,
	"top_cons" jsonb DEFAULT '[]'::jsonb,
	"common_topics" jsonb DEFAULT '[]'::jsonb,
	"ai_model" varchar(100),
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "scrape_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"gym_id" integer,
	"chain_id" integer,
	"source" "scraper_source" NOT NULL,
	"status" varchar(50) DEFAULT 'pending',
	"raw_html_size" integer,
	"parsed_json" jsonb,
	"error_message" text,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"finished_at" timestamp
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "alerts" ADD CONSTRAINT "alerts_gym_id_gyms_id_fk" FOREIGN KEY ("gym_id") REFERENCES "public"."gyms"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "gym_facilities" ADD CONSTRAINT "gym_facilities_gym_id_gyms_id_fk" FOREIGN KEY ("gym_id") REFERENCES "public"."gyms"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "gym_facilities" ADD CONSTRAINT "gym_facilities_facility_id_facilities_id_fk" FOREIGN KEY ("facility_id") REFERENCES "public"."facilities"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "gyms" ADD CONSTRAINT "gyms_city_id_cities_id_fk" FOREIGN KEY ("city_id") REFERENCES "public"."cities"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "gyms" ADD CONSTRAINT "gyms_neighborhood_id_neighborhoods_id_fk" FOREIGN KEY ("neighborhood_id") REFERENCES "public"."neighborhoods"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "gyms" ADD CONSTRAINT "gyms_chain_id_chains_id_fk" FOREIGN KEY ("chain_id") REFERENCES "public"."chains"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "neighborhoods" ADD CONSTRAINT "neighborhoods_city_id_cities_id_fk" FOREIGN KEY ("city_id") REFERENCES "public"."cities"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "prices_history" ADD CONSTRAINT "prices_history_gym_id_gyms_id_fk" FOREIGN KEY ("gym_id") REFERENCES "public"."gyms"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "reviews_summary" ADD CONSTRAINT "reviews_summary_gym_id_gyms_id_fk" FOREIGN KEY ("gym_id") REFERENCES "public"."gyms"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "scrape_logs" ADD CONSTRAINT "scrape_logs_gym_id_gyms_id_fk" FOREIGN KEY ("gym_id") REFERENCES "public"."gyms"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "scrape_logs" ADD CONSTRAINT "scrape_logs_chain_id_chains_id_fk" FOREIGN KEY ("chain_id") REFERENCES "public"."chains"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_alerts_type_resolved" ON "alerts" USING btree ("type","resolved");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_chains_slug" ON "chains" USING btree ("slug");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_cities_slug" ON "cities" USING btree ("slug");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_facilities_category" ON "facilities" USING btree ("category");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idx_gym_facility_unique" ON "gym_facilities" USING btree ("gym_id","facility_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_gyms_slug" ON "gyms" USING btree ("slug");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_gyms_city" ON "gyms" USING btree ("city_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_gyms_chain" ON "gyms" USING btree ("chain_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_gyms_status" ON "gyms" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_gyms_coordinates" ON "gyms" USING gist ("coordinates");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_gyms_embedding" ON "gyms" USING hnsw ("embedding" vector_l2_ops) WITH (m=16,ef_construction=200);--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idx_neighborhood_city_slug" ON "neighborhoods" USING btree ("city_id","slug");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_prices_gym_id" ON "prices_history" USING btree ("gym_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_prices_gym_type_date" ON "prices_history" USING btree ("gym_id","price_type","recorded_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_reviews_gym_id" ON "reviews_summary" USING btree ("gym_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_scrapelogs_gym" ON "scrape_logs" USING btree ("gym_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_scrapelogs_status" ON "scrape_logs" USING btree ("status");