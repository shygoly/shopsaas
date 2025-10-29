CREATE TABLE IF NOT EXISTS "audit_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" serial NOT NULL,
	"action" varchar(100) NOT NULL,
	"resource_type" varchar(50),
	"resource_id" varchar(100),
	"details" jsonb,
	"ip_address" varchar(45),
	"user_agent" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "credit_transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" serial NOT NULL,
	"amount" integer NOT NULL,
	"reason" varchar(100) NOT NULL,
	"related_shop_id" integer,
	"balance_after" integer NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "deployments" (
	"id" serial PRIMARY KEY NOT NULL,
	"shop_id" serial NOT NULL,
	"github_run_id" varchar(100),
	"status" varchar(50) DEFAULT 'queued',
	"logs" text,
	"error_message" text,
	"started_at" timestamp,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "email_tokens" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"token" uuid DEFAULT gen_random_uuid() NOT NULL,
	"token_type" varchar(50) NOT NULL,
	"expires_at" timestamp NOT NULL,
	"used" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "oauth_accounts" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" serial NOT NULL,
	"provider" varchar(50) NOT NULL,
	"provider_id" varchar(255) NOT NULL,
	"provider_data" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "shop_secrets" (
	"id" serial PRIMARY KEY NOT NULL,
	"shop_id" serial NOT NULL,
	"sso_secret" varchar(255) NOT NULL,
	"webhook_secret" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "shop_secrets_shop_id_unique" UNIQUE("shop_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "shops" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" serial NOT NULL,
	"shop_name" varchar(255) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"app_name" varchar(100) NOT NULL,
	"domain" varchar(255),
	"status" varchar(50) DEFAULT 'creating',
	"admin_email" varchar(255) NOT NULL,
	"config" jsonb,
	"deployed_image" varchar(500),
	"deployed_at" timestamp,
	"machine_id" varchar(100),
	"machine_config" jsonb,
	"runtime_metrics" jsonb,
	"chatbot_enabled" boolean DEFAULT false,
	"chatbot_bot_id" varchar(100),
	"chatbot_enabled_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "shops_slug_unique" UNIQUE("slug"),
	CONSTRAINT "shops_app_name_unique" UNIQUE("app_name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "subscriptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" serial NOT NULL,
	"shop_id" serial NOT NULL,
	"feature" varchar(50) NOT NULL,
	"status" varchar(50) DEFAULT 'active',
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" varchar(255),
	"name" varchar(255),
	"avatar_url" text,
	"email_verified" boolean DEFAULT false,
	"email_verified_at" timestamp,
	"last_login_at" timestamp,
	"password_reset_token" varchar(255),
	"password_reset_expires" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "audit_user_idx" ON "audit_logs" ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "audit_action_idx" ON "audit_logs" ("action");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "audit_created_idx" ON "audit_logs" ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "credit_user_idx" ON "credit_transactions" ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "credit_created_idx" ON "credit_transactions" ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "deployment_shop_idx" ON "deployments" ("shop_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "deployment_status_idx" ON "deployments" ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "deployment_run_id_idx" ON "deployments" ("github_run_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "email_token_idx" ON "email_tokens" ("token");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "email_type_idx" ON "email_tokens" ("email","token_type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "oauth_provider_idx" ON "oauth_accounts" ("provider","provider_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "shop_user_idx" ON "shops" ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "shop_status_idx" ON "shops" ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "subscription_shop_idx" ON "subscriptions" ("shop_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "subscription_feature_idx" ON "subscriptions" ("feature");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "subscription_status_idx" ON "subscriptions" ("status");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "credit_transactions" ADD CONSTRAINT "credit_transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "deployments" ADD CONSTRAINT "deployments_shop_id_shops_id_fk" FOREIGN KEY ("shop_id") REFERENCES "shops"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "oauth_accounts" ADD CONSTRAINT "oauth_accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "shop_secrets" ADD CONSTRAINT "shop_secrets_shop_id_shops_id_fk" FOREIGN KEY ("shop_id") REFERENCES "shops"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "shops" ADD CONSTRAINT "shops_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_shop_id_shops_id_fk" FOREIGN KEY ("shop_id") REFERENCES "shops"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
