CREATE TABLE "offers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"type" text NOT NULL,
	"discount_type" text NOT NULL,
	"discount_value" numeric(10, 2) NOT NULL,
	"minimum_order_amount" numeric(10, 2),
	"maximum_discount_amount" numeric(10, 2),
	"target_audience" text DEFAULT 'all',
	"occasion_type" text,
	"usage_limit" integer,
	"used_count" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"priority" integer DEFAULT 0,
	"valid_from" timestamp NOT NULL,
	"valid_until" timestamp NOT NULL,
	"popup_delay_seconds" integer DEFAULT 10,
	"show_frequency_hours" integer DEFAULT 24,
	"click_count" integer DEFAULT 0,
	"view_count" integer DEFAULT 0,
	"conversion_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_offer_interactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"offer_id" uuid NOT NULL,
	"session_id" text,
	"interaction_type" text NOT NULL,
	"order_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DROP TABLE "coupons" CASCADE;--> statement-breakpoint
ALTER TABLE "user_offer_interactions" ADD CONSTRAINT "user_offer_interactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_offer_interactions" ADD CONSTRAINT "user_offer_interactions_offer_id_offers_id_fk" FOREIGN KEY ("offer_id") REFERENCES "public"."offers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_offer_interactions" ADD CONSTRAINT "user_offer_interactions_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;