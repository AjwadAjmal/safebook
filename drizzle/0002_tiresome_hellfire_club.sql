CREATE TYPE "public"."account_type" AS ENUM('giro', 'depot', 'cash');--> statement-breakpoint
CREATE TABLE "accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" "account_type" NOT NULL,
	"name" varchar(255) NOT NULL,
	"institution" varchar(255) NOT NULL,
	"current_value" numeric(12, 2) NOT NULL,
	"invested_capital" numeric(12, 2),
	"initial_date" timestamp NOT NULL,
	"user_id" uuid NOT NULL,
	"household_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_household_id_households_id_fk" FOREIGN KEY ("household_id") REFERENCES "public"."households"("id") ON DELETE no action ON UPDATE no action;