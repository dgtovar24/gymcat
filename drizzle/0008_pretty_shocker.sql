ALTER TABLE "gyms" ADD COLUMN "price_is_verified" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "gyms" ADD COLUMN "daily_price" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "gyms" ADD COLUMN "price_period" varchar(20) DEFAULT 'monthly';