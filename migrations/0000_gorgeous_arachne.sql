CREATE TYPE "public"."badge_type" AS ENUM('quest_initiate', 'weekly_hustler', 'musk_learner', 'thought_leader', 'portfolio_star', 'visibility_boosted');--> statement-breakpoint
CREATE TYPE "public"."media_type" AS ENUM('image', 'video');--> statement-breakpoint
CREATE TYPE "public"."news_source_category" AS ENUM('technology', 'business', 'finance', 'marketing', 'design', 'healthcare', 'education', 'engineering', 'general');--> statement-breakpoint
CREATE TYPE "public"."nowboard_category" AS ENUM('growth', 'learning', 'launch', 'planning', 'collaboration', 'visibility');--> statement-breakpoint
CREATE TYPE "public"."portfolio_layout" AS ENUM('professional', 'creative', 'minimal', 'technical', 'executive', 'minimalist_pro');--> statement-breakpoint
CREATE TYPE "public"."pulse_category" AS ENUM('certification', 'launch', 'award', 'project', 'announcement', 'highlight');--> statement-breakpoint
CREATE TYPE "public"."pulse_type" AS ENUM('poll', 'media-pulse', 'project', 'news-pulse');--> statement-breakpoint
CREATE TYPE "public"."quest_status" AS ENUM('active', 'completed', 'dismissed', 'expired');--> statement-breakpoint
CREATE TYPE "public"."quest_type" AS ENUM('profile_update', 'pulse_creation', 'networking', 'learning', 'portfolio', 'resume', 'visibility');--> statement-breakpoint
CREATE TYPE "public"."reaction_type" AS ENUM('insightful', 'misinformed');--> statement-breakpoint
CREATE TYPE "public"."resume_theme" AS ENUM('professional', 'creative', 'minimal', 'technical', 'executive', 'minimalist_pro', 'timeline', 'visual_expert', 'freelancer_hub', 'scholar', 'animated', 'dynamic_innovator');--> statement-breakpoint
CREATE TYPE "public"."service_category" AS ENUM('consulting', 'development', 'design', 'marketing', 'writing', 'coaching', 'teaching', 'other');--> statement-breakpoint
CREATE TABLE "chat_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"content" text NOT NULL,
	"sender" text NOT NULL,
	"message_type" text DEFAULT 'general',
	"timestamp" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "educations" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"degree" text NOT NULL,
	"institution" text NOT NULL,
	"location" text,
	"start_date" text NOT NULL,
	"end_date" text
);
--> statement-breakpoint
CREATE TABLE "email_verifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"token" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"verified" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hashtags" (
	"id" serial PRIMARY KEY NOT NULL,
	"tag" text NOT NULL,
	"count" integer DEFAULT 1,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "hashtags_tag_unique" UNIQUE("tag")
);
--> statement-breakpoint
CREATE TABLE "musk_matches" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"suggested_user_id" integer NOT NULL,
	"match_type" text NOT NULL,
	"match_score" integer DEFAULT 0,
	"match_reason" text,
	"industry" text,
	"domain" text,
	"skills" jsonb DEFAULT '[]',
	"is_read" boolean DEFAULT false,
	"is_dismissed" boolean DEFAULT false,
	"is_connected" boolean DEFAULT false,
	"shown_at" timestamp DEFAULT now(),
	"expires_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "news_articles" (
	"id" serial PRIMARY KEY NOT NULL,
	"source_id" integer,
	"title" text NOT NULL,
	"description" text,
	"content" text,
	"url" text,
	"image_url" text,
	"author" text,
	"published_at" timestamp,
	"category" "news_source_category",
	"industries" jsonb DEFAULT '[]',
	"processed" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "news_sources" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"url" text NOT NULL,
	"category" "news_source_category" NOT NULL,
	"api_endpoint" text,
	"api_key" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "news_user_preferences" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"preferred_industries" jsonb DEFAULT '[]',
	"preferred_sources" jsonb DEFAULT '[]',
	"excluded_sources" jsonb DEFAULT '[]',
	"delivery_time" text DEFAULT '17:00',
	"enabled" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "nowboard_inspired_by" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"nowboard_item_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "nowboard_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"content" varchar(150) NOT NULL,
	"category" "nowboard_category" NOT NULL,
	"visibility" varchar(20) DEFAULT 'public' NOT NULL,
	"inspired_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "otp_verifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"phone_number" text NOT NULL,
	"otp" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"verified" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "poll_votes" (
	"id" serial PRIMARY KEY NOT NULL,
	"pulse_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"option_index" integer NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "portfolios" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"layout" "portfolio_layout" DEFAULT 'professional' NOT NULL,
	"custom_title" text,
	"custom_bio" text,
	"customization_options" jsonb DEFAULT '{}',
	"is_published" boolean DEFAULT false,
	"public_url" text,
	"featured_projects" jsonb DEFAULT '[]',
	"featured_skills" jsonb DEFAULT '[]',
	"featured_experiences" jsonb DEFAULT '[]',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "project_collaborators" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"name" text DEFAULT 'Team Member' NOT NULL,
	"email" text,
	"role" text DEFAULT 'Collaborator' NOT NULL,
	"profile_link" text NOT NULL,
	"user_id" integer,
	"invite_status" text DEFAULT 'Pending',
	"invite_token" text,
	"invite_expires" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "project_endorsements" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"client_name" text NOT NULL,
	"client_email" text,
	"client_title" text,
	"client_company" text,
	"message" text,
	"rating" integer,
	"is_verified" boolean DEFAULT false,
	"verification_token" text,
	"verification_expires" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"start_date" text,
	"project_url" text,
	"category" text,
	"thumbnail_url" text,
	"thumbnail_file" text,
	"media_urls" jsonb DEFAULT '[]',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "pulse_comments" (
	"id" serial PRIMARY KEY NOT NULL,
	"pulse_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"content" text NOT NULL,
	"likes" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "pulse_hashtags" (
	"id" serial PRIMARY KEY NOT NULL,
	"pulse_id" integer NOT NULL,
	"hashtag_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "pulse_reactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"pulse_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"reaction_type" "reaction_type" NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "pulse_shares" (
	"id" serial PRIMARY KEY NOT NULL,
	"pulse_id" integer NOT NULL,
	"sender_id" integer NOT NULL,
	"recipient_id" integer NOT NULL,
	"message" text,
	"is_read" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "pulses" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"type" "pulse_type" NOT NULL,
	"category" "pulse_category",
	"title" text NOT NULL,
	"content" text,
	"industry" text,
	"media_type" "media_type",
	"media_urls" jsonb DEFAULT '[]',
	"media_local_storage_keys" jsonb DEFAULT '[]',
	"poll_options" jsonb DEFAULT '[]',
	"project_id" integer,
	"likes" integer DEFAULT 0,
	"insightful_count" integer DEFAULT 0,
	"misinformed_count" integer DEFAULT 0,
	"share_count" integer DEFAULT 0,
	"comments" integer DEFAULT 0,
	"is_published" boolean DEFAULT true,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "quest_definitions" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"type" "quest_type" NOT NULL,
	"target_count" integer DEFAULT 1 NOT NULL,
	"target_action" text NOT NULL,
	"xp_reward" integer DEFAULT 50 NOT NULL,
	"badge_reward" "badge_type",
	"required_profile_completion" integer DEFAULT 0,
	"required_career_stage" text,
	"required_industry" text,
	"musk_tip" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "resumes" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"file_name" text NOT NULL,
	"file_data" text NOT NULL,
	"score" integer DEFAULT 0,
	"uploaded_at" timestamp DEFAULT now(),
	"is_shadow_resume" boolean DEFAULT false,
	"theme_style" "resume_theme" DEFAULT 'professional',
	"is_downloadable" boolean DEFAULT false,
	"last_updated_by_musk" timestamp,
	"visibility" text DEFAULT 'private'
);
--> statement-breakpoint
CREATE TABLE "services" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"category" "service_category" DEFAULT 'other' NOT NULL,
	"price_inr" numeric(10, 2),
	"price_usd" numeric(10, 2),
	"is_hourly" boolean DEFAULT false,
	"features" jsonb DEFAULT '[]',
	"image_url" text,
	"order" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "shadow_resumes" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"resume_id" integer,
	"content" jsonb NOT NULL,
	"suggestions" jsonb DEFAULT '[]',
	"history" jsonb DEFAULT '[]',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "skills" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"name" text NOT NULL,
	"level" text NOT NULL,
	"proficiency" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "user_badges" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"badge_type" "badge_type" NOT NULL,
	"earned_at" timestamp DEFAULT now(),
	"quest_id" integer,
	"display_on_profile" boolean DEFAULT true,
	"display_on_resume" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "user_hashtag_follows" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"hashtag_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_quests" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"quest_definition_id" integer NOT NULL,
	"status" "quest_status" DEFAULT 'active' NOT NULL,
	"progress" integer DEFAULT 0 NOT NULL,
	"assigned_at" timestamp DEFAULT now(),
	"completed_at" timestamp,
	"week_number" integer NOT NULL,
	"year" integer NOT NULL,
	"dismissed_reason" text,
	"xp_earned" integer,
	"badge_earned" "badge_type",
	"musk_response" text
);
--> statement-breakpoint
CREATE TABLE "user_reaction_quotas" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"date" timestamp NOT NULL,
	"insightful_quota_used" integer DEFAULT 0,
	"misinformed_quota_used" integer DEFAULT 0,
	"insightful_quota_max" integer DEFAULT 10,
	"misinformed_quota_max" integer DEFAULT 10,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_xp" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"balance" integer DEFAULT 0 NOT NULL,
	"lifetime_earned" integer DEFAULT 0 NOT NULL,
	"current_month_earned" integer DEFAULT 0 NOT NULL,
	"last_earned_at" timestamp,
	"last_reset_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"email" text NOT NULL,
	"password" text,
	"phone_number" text,
	"name" text,
	"photo_url" text,
	"title" text,
	"about_me" text,
	"location" text,
	"industry" text,
	"domain" text,
	"company" text,
	"looking_for" text,
	"visiting_card_type" text,
	"profile_completed" integer DEFAULT 0,
	"geo_latitude" numeric(10, 7),
	"geo_longitude" numeric(10, 7),
	"geo_visible_nearby" boolean DEFAULT true,
	"geo_last_updated" timestamp,
	"email_verified" boolean DEFAULT false,
	"email_verification_token" text,
	"email_verification_expires" timestamp,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_phone_number_unique" UNIQUE("phone_number")
);
--> statement-breakpoint
CREATE TABLE "work_experiences" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"title" text NOT NULL,
	"company" text NOT NULL,
	"industry" text,
	"domain" text,
	"location" text,
	"start_date" text NOT NULL,
	"end_date" text,
	"description" text
);
--> statement-breakpoint
CREATE TABLE "xp_transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"amount" integer NOT NULL,
	"source" text NOT NULL,
	"source_id" integer,
	"description" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "educations" ADD CONSTRAINT "educations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "musk_matches" ADD CONSTRAINT "musk_matches_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "musk_matches" ADD CONSTRAINT "musk_matches_suggested_user_id_users_id_fk" FOREIGN KEY ("suggested_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "news_articles" ADD CONSTRAINT "news_articles_source_id_news_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."news_sources"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "news_user_preferences" ADD CONSTRAINT "news_user_preferences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nowboard_inspired_by" ADD CONSTRAINT "nowboard_inspired_by_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nowboard_inspired_by" ADD CONSTRAINT "nowboard_inspired_by_nowboard_item_id_nowboard_items_id_fk" FOREIGN KEY ("nowboard_item_id") REFERENCES "public"."nowboard_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nowboard_items" ADD CONSTRAINT "nowboard_items_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "poll_votes" ADD CONSTRAINT "poll_votes_pulse_id_pulses_id_fk" FOREIGN KEY ("pulse_id") REFERENCES "public"."pulses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "poll_votes" ADD CONSTRAINT "poll_votes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "portfolios" ADD CONSTRAINT "portfolios_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_collaborators" ADD CONSTRAINT "project_collaborators_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_collaborators" ADD CONSTRAINT "project_collaborators_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_endorsements" ADD CONSTRAINT "project_endorsements_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pulse_comments" ADD CONSTRAINT "pulse_comments_pulse_id_pulses_id_fk" FOREIGN KEY ("pulse_id") REFERENCES "public"."pulses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pulse_comments" ADD CONSTRAINT "pulse_comments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pulse_hashtags" ADD CONSTRAINT "pulse_hashtags_pulse_id_pulses_id_fk" FOREIGN KEY ("pulse_id") REFERENCES "public"."pulses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pulse_hashtags" ADD CONSTRAINT "pulse_hashtags_hashtag_id_hashtags_id_fk" FOREIGN KEY ("hashtag_id") REFERENCES "public"."hashtags"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pulse_reactions" ADD CONSTRAINT "pulse_reactions_pulse_id_pulses_id_fk" FOREIGN KEY ("pulse_id") REFERENCES "public"."pulses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pulse_reactions" ADD CONSTRAINT "pulse_reactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pulse_shares" ADD CONSTRAINT "pulse_shares_pulse_id_pulses_id_fk" FOREIGN KEY ("pulse_id") REFERENCES "public"."pulses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pulse_shares" ADD CONSTRAINT "pulse_shares_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pulse_shares" ADD CONSTRAINT "pulse_shares_recipient_id_users_id_fk" FOREIGN KEY ("recipient_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pulses" ADD CONSTRAINT "pulses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pulses" ADD CONSTRAINT "pulses_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resumes" ADD CONSTRAINT "resumes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "services" ADD CONSTRAINT "services_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shadow_resumes" ADD CONSTRAINT "shadow_resumes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shadow_resumes" ADD CONSTRAINT "shadow_resumes_resume_id_resumes_id_fk" FOREIGN KEY ("resume_id") REFERENCES "public"."resumes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "skills" ADD CONSTRAINT "skills_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_badges" ADD CONSTRAINT "user_badges_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_badges" ADD CONSTRAINT "user_badges_quest_id_user_quests_id_fk" FOREIGN KEY ("quest_id") REFERENCES "public"."user_quests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_hashtag_follows" ADD CONSTRAINT "user_hashtag_follows_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_hashtag_follows" ADD CONSTRAINT "user_hashtag_follows_hashtag_id_hashtags_id_fk" FOREIGN KEY ("hashtag_id") REFERENCES "public"."hashtags"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_quests" ADD CONSTRAINT "user_quests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_quests" ADD CONSTRAINT "user_quests_quest_definition_id_quest_definitions_id_fk" FOREIGN KEY ("quest_definition_id") REFERENCES "public"."quest_definitions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_reaction_quotas" ADD CONSTRAINT "user_reaction_quotas_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_xp" ADD CONSTRAINT "user_xp_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "work_experiences" ADD CONSTRAINT "work_experiences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "xp_transactions" ADD CONSTRAINT "xp_transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;