ALTER TABLE "orders" ADD COLUMN "scheduled_for" timestamp;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "add_ons" jsonb;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "loyalty_points" integer DEFAULT 0 NOT NULL;