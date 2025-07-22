CREATE TABLE "upi_payment" (
	"id" integer PRIMARY KEY NOT NULL,
	"order_id" text NOT NULL,
	"upi_id" text NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"status" text NOT NULL,
	"transaction_id" text,
	"created_at" timestamp DEFAULT now()
);
