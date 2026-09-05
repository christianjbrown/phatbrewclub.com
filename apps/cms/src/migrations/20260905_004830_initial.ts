import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_venues_opening_hours_day" AS ENUM('mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun');
  CREATE TYPE "public"."enum_venues_amenities" AS ENUM('Beer garden', 'Kids zone', 'Arcade games', 'Dog friendly', 'Ocean views', 'Live music', 'Wheelchair accessible', 'Parking', 'Function spaces', 'Fresh seafood', 'Family friendly', 'Sports screens', 'Outdoor seating');
  CREATE TYPE "public"."enum_venues_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__venues_v_version_opening_hours_day" AS ENUM('mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun');
  CREATE TYPE "public"."enum__venues_v_version_amenities" AS ENUM('Beer garden', 'Kids zone', 'Arcade games', 'Dog friendly', 'Ocean views', 'Live music', 'Wheelchair accessible', 'Parking', 'Function spaces', 'Fresh seafood', 'Family friendly', 'Sports screens', 'Outdoor seating');
  CREATE TYPE "public"."enum__venues_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_beers_category" AS ENUM('core', 'seasonal', 'limited', 'collab');
  CREATE TYPE "public"."enum_beers_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__beers_v_version_category" AS ENUM('core', 'seasonal', 'limited', 'collab');
  CREATE TYPE "public"."enum__beers_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_tap_lists_source" AS ENUM('manual', 'meandu');
  CREATE TYPE "public"."enum_events_recurrence" AS ENUM('once', 'weekly', 'fortnightly', 'monthly');
  CREATE TYPE "public"."enum_events_category" AS ENUM('Quiz', 'Live music', 'Food special', 'Beer release', 'Sport', 'Competition', 'Other');
  CREATE TYPE "public"."enum_events_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__events_v_version_recurrence" AS ENUM('once', 'weekly', 'fortnightly', 'monthly');
  CREATE TYPE "public"."enum__events_v_version_category" AS ENUM('Quiz', 'Live music', 'Food special', 'Beer release', 'Sport', 'Competition', 'Other');
  CREATE TYPE "public"."enum__events_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_function_packages_seating" AS ENUM('standing', 'seated', 'mixed');
  CREATE TYPE "public"."enum_function_packages_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__function_packages_v_version_seating" AS ENUM('standing', 'seated', 'mixed');
  CREATE TYPE "public"."enum__function_packages_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_pages_blocks_beer_grid_filter_by" AS ENUM('all', 'core', 'seasonal', 'limited');
  CREATE TYPE "public"."enum_pages_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__pages_v_blocks_beer_grid_filter_by" AS ENUM('all', 'core', 'seasonal', 'limited');
  CREATE TYPE "public"."enum__pages_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_posts_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__posts_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_users_roles" AS ENUM('admin', 'venueManager', 'staff');
  CREATE TABLE "venues_opening_hours" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"day" "enum_venues_opening_hours_day",
  	"opens" varchar,
  	"closes" varchar,
  	"closed" boolean
  );
  
  CREATE TABLE "venues_hours_overrides" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"date" timestamp(3) with time zone,
  	"label" varchar,
  	"opens" varchar,
  	"closes" varchar,
  	"closed" boolean
  );
  
  CREATE TABLE "venues_amenities" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_venues_amenities",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "venues" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"short_name" varchar,
  	"slug" varchar,
  	"address_street" varchar,
  	"address_suburb" varchar,
  	"address_state" varchar DEFAULT 'WA',
  	"address_postcode" varchar,
  	"address_latitude" numeric,
  	"address_longitude" numeric,
  	"transport_note" varchar,
  	"phone" varchar,
  	"email" varchar,
  	"hero_image_id" integer,
  	"intro" jsonb,
  	"capacity" numeric,
  	"tap_count" numeric DEFAULT 20,
  	"booking_url" varchar,
  	"meandu_slug" varchar,
  	"menu_url" varchar,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"seo_image_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_venues_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "venues_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer
  );
  
  CREATE TABLE "_venues_v_version_opening_hours" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"day" "enum__venues_v_version_opening_hours_day",
  	"opens" varchar,
  	"closes" varchar,
  	"closed" boolean,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_venues_v_version_hours_overrides" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"date" timestamp(3) with time zone,
  	"label" varchar,
  	"opens" varchar,
  	"closes" varchar,
  	"closed" boolean,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_venues_v_version_amenities" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__venues_v_version_amenities",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_venues_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_name" varchar,
  	"version_short_name" varchar,
  	"version_slug" varchar,
  	"version_address_street" varchar,
  	"version_address_suburb" varchar,
  	"version_address_state" varchar DEFAULT 'WA',
  	"version_address_postcode" varchar,
  	"version_address_latitude" numeric,
  	"version_address_longitude" numeric,
  	"version_transport_note" varchar,
  	"version_phone" varchar,
  	"version_email" varchar,
  	"version_hero_image_id" integer,
  	"version_intro" jsonb,
  	"version_capacity" numeric,
  	"version_tap_count" numeric DEFAULT 20,
  	"version_booking_url" varchar,
  	"version_meandu_slug" varchar,
  	"version_menu_url" varchar,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"version_seo_image_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__venues_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "_venues_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer
  );
  
  CREATE TABLE "beers_ingredients" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"producer" varchar,
  	"contribution" varchar
  );
  
  CREATE TABLE "beers" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"slug" varchar,
  	"style" varchar,
  	"abv" numeric,
  	"ibu" numeric,
  	"category" "enum_beers_category" DEFAULT 'core',
  	"description" varchar,
  	"tasting_notes" jsonb,
  	"can_artwork_id" integer,
  	"untappd_url" varchar,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"seo_image_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_beers_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "beers_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"venues_id" integer
  );
  
  CREATE TABLE "_beers_v_version_ingredients" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"producer" varchar,
  	"contribution" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_beers_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_name" varchar,
  	"version_slug" varchar,
  	"version_style" varchar,
  	"version_abv" numeric,
  	"version_ibu" numeric,
  	"version_category" "enum__beers_v_version_category" DEFAULT 'core',
  	"version_description" varchar,
  	"version_tasting_notes" jsonb,
  	"version_can_artwork_id" integer,
  	"version_untappd_url" varchar,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"version_seo_image_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__beers_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "_beers_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"venues_id" integer
  );
  
  CREATE TABLE "tap_lists_taps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"tap_number" numeric NOT NULL,
  	"beer_id" integer NOT NULL,
  	"keg_blown" boolean
  );
  
  CREATE TABLE "tap_lists" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"venue_id" integer NOT NULL,
  	"source" "enum_tap_lists_source" DEFAULT 'manual',
  	"synced_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "events" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"slug" varchar,
  	"starts_at" timestamp(3) with time zone,
  	"ends_at" timestamp(3) with time zone,
  	"recurrence" "enum_events_recurrence" DEFAULT 'once',
  	"repeats_until" timestamp(3) with time zone,
  	"category" "enum_events_category",
  	"hero_image_id" integer,
  	"body" jsonb,
  	"is_free" boolean DEFAULT true,
  	"price" varchar,
  	"booking_url" varchar,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"seo_image_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_events_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "events_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"venues_id" integer
  );
  
  CREATE TABLE "_events_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_starts_at" timestamp(3) with time zone,
  	"version_ends_at" timestamp(3) with time zone,
  	"version_recurrence" "enum__events_v_version_recurrence" DEFAULT 'once',
  	"version_repeats_until" timestamp(3) with time zone,
  	"version_category" "enum__events_v_version_category",
  	"version_hero_image_id" integer,
  	"version_body" jsonb,
  	"version_is_free" boolean DEFAULT true,
  	"version_price" varchar,
  	"version_booking_url" varchar,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"version_seo_image_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__events_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "_events_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"venues_id" integer
  );
  
  CREATE TABLE "menus_sections_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"price" varchar,
  	"dietary" varchar,
  	"description" varchar
  );
  
  CREATE TABLE "menus_sections" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar
  );
  
  CREATE TABLE "menus" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"venue_id" integer NOT NULL,
  	"meandu_id" varchar,
  	"synced_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "function_packages_inclusions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"item" varchar
  );
  
  CREATE TABLE "function_packages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"slug" varchar,
  	"venue_id" integer,
  	"capacity" numeric,
  	"seating" "enum_function_packages_seating",
  	"price_guide" varchar,
  	"image_id" integer,
  	"description" jsonb,
  	"brochure_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_function_packages_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_function_packages_v_version_inclusions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"item" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_function_packages_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_name" varchar,
  	"version_slug" varchar,
  	"version_venue_id" integer,
  	"version_capacity" numeric,
  	"version_seating" "enum__function_packages_v_version_seating",
  	"version_price_guide" varchar,
  	"version_image_id" integer,
  	"version_description" jsonb,
  	"version_brochure_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__function_packages_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "pages_blocks_hero_actions" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"url" varchar
  );
  
  CREATE TABLE "pages_blocks_hero" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"lede" varchar,
  	"image_id" integer,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_rich_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"body" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_venue_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_beer_grid" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"filter_by" "enum_pages_blocks_beer_grid_filter_by" DEFAULT 'all',
  	"limit" numeric DEFAULT 12,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_event_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"venue_id" integer,
  	"limit" numeric DEFAULT 4,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_tap_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"venue_id" integer,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_faq_questions" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" jsonb
  );
  
  CREATE TABLE "pages_blocks_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"slug" varchar,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"seo_image_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_pages_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "pages_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"venues_id" integer
  );
  
  CREATE TABLE "_pages_v_blocks_hero_actions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"url" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_hero" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"lede" varchar,
  	"image_id" integer,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_rich_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"body" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_venue_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_beer_grid" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"filter_by" "enum__pages_v_blocks_beer_grid_filter_by" DEFAULT 'all',
  	"limit" numeric DEFAULT 12,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_event_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"venue_id" integer,
  	"limit" numeric DEFAULT 4,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_tap_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"venue_id" integer,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_faq_questions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" jsonb,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"version_seo_image_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__pages_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "_pages_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"venues_id" integer
  );
  
  CREATE TABLE "posts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"slug" varchar,
  	"published_at" timestamp(3) with time zone,
  	"hero_image_id" integer,
  	"excerpt" varchar,
  	"body" jsonb,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"seo_image_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_posts_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_posts_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_published_at" timestamp(3) with time zone,
  	"version_hero_image_id" integer,
  	"version_excerpt" varchar,
  	"version_body" jsonb,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"version_seo_image_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__posts_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar NOT NULL,
  	"credit" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_thumbnail_url" varchar,
  	"sizes_thumbnail_width" numeric,
  	"sizes_thumbnail_height" numeric,
  	"sizes_thumbnail_mime_type" varchar,
  	"sizes_thumbnail_filesize" numeric,
  	"sizes_thumbnail_filename" varchar,
  	"sizes_card_url" varchar,
  	"sizes_card_width" numeric,
  	"sizes_card_height" numeric,
  	"sizes_card_mime_type" varchar,
  	"sizes_card_filesize" numeric,
  	"sizes_card_filename" varchar,
  	"sizes_hero_url" varchar,
  	"sizes_hero_width" numeric,
  	"sizes_hero_height" numeric,
  	"sizes_hero_mime_type" varchar,
  	"sizes_hero_filesize" numeric,
  	"sizes_hero_filename" varchar,
  	"sizes_square_url" varchar,
  	"sizes_square_width" numeric,
  	"sizes_square_height" numeric,
  	"sizes_square_mime_type" varchar,
  	"sizes_square_filesize" numeric,
  	"sizes_square_filename" varchar
  );
  
  CREATE TABLE "users_roles" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_users_roles",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"venues_id" integer,
  	"beers_id" integer,
  	"tap_lists_id" integer,
  	"events_id" integer,
  	"menus_id" integer,
  	"function_packages_id" integer,
  	"pages_id" integer,
  	"posts_id" integer,
  	"media_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "settings_main_nav" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"url" varchar NOT NULL
  );
  
  CREATE TABLE "settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"announcement" varchar,
  	"announcement_url" varchar,
  	"announcement_until" timestamp(3) with time zone,
  	"booking_label" varchar DEFAULT 'Book a table',
  	"instagram" varchar,
  	"facebook" varchar,
  	"untappd" varchar,
  	"default_title" varchar,
  	"default_description" varchar,
  	"default_image_id" integer,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "venues_opening_hours" ADD CONSTRAINT "venues_opening_hours_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."venues"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "venues_hours_overrides" ADD CONSTRAINT "venues_hours_overrides_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."venues"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "venues_amenities" ADD CONSTRAINT "venues_amenities_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."venues"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "venues" ADD CONSTRAINT "venues_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "venues" ADD CONSTRAINT "venues_seo_image_id_media_id_fk" FOREIGN KEY ("seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "venues_rels" ADD CONSTRAINT "venues_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."venues"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "venues_rels" ADD CONSTRAINT "venues_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_venues_v_version_opening_hours" ADD CONSTRAINT "_venues_v_version_opening_hours_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_venues_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_venues_v_version_hours_overrides" ADD CONSTRAINT "_venues_v_version_hours_overrides_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_venues_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_venues_v_version_amenities" ADD CONSTRAINT "_venues_v_version_amenities_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_venues_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_venues_v" ADD CONSTRAINT "_venues_v_parent_id_venues_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."venues"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_venues_v" ADD CONSTRAINT "_venues_v_version_hero_image_id_media_id_fk" FOREIGN KEY ("version_hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_venues_v" ADD CONSTRAINT "_venues_v_version_seo_image_id_media_id_fk" FOREIGN KEY ("version_seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_venues_v_rels" ADD CONSTRAINT "_venues_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_venues_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_venues_v_rels" ADD CONSTRAINT "_venues_v_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "beers_ingredients" ADD CONSTRAINT "beers_ingredients_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."beers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "beers" ADD CONSTRAINT "beers_can_artwork_id_media_id_fk" FOREIGN KEY ("can_artwork_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "beers" ADD CONSTRAINT "beers_seo_image_id_media_id_fk" FOREIGN KEY ("seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "beers_rels" ADD CONSTRAINT "beers_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."beers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "beers_rels" ADD CONSTRAINT "beers_rels_venues_fk" FOREIGN KEY ("venues_id") REFERENCES "public"."venues"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_beers_v_version_ingredients" ADD CONSTRAINT "_beers_v_version_ingredients_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_beers_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_beers_v" ADD CONSTRAINT "_beers_v_parent_id_beers_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."beers"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_beers_v" ADD CONSTRAINT "_beers_v_version_can_artwork_id_media_id_fk" FOREIGN KEY ("version_can_artwork_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_beers_v" ADD CONSTRAINT "_beers_v_version_seo_image_id_media_id_fk" FOREIGN KEY ("version_seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_beers_v_rels" ADD CONSTRAINT "_beers_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_beers_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_beers_v_rels" ADD CONSTRAINT "_beers_v_rels_venues_fk" FOREIGN KEY ("venues_id") REFERENCES "public"."venues"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "tap_lists_taps" ADD CONSTRAINT "tap_lists_taps_beer_id_beers_id_fk" FOREIGN KEY ("beer_id") REFERENCES "public"."beers"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "tap_lists_taps" ADD CONSTRAINT "tap_lists_taps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."tap_lists"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "tap_lists" ADD CONSTRAINT "tap_lists_venue_id_venues_id_fk" FOREIGN KEY ("venue_id") REFERENCES "public"."venues"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events" ADD CONSTRAINT "events_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events" ADD CONSTRAINT "events_seo_image_id_media_id_fk" FOREIGN KEY ("seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events_rels" ADD CONSTRAINT "events_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "events_rels" ADD CONSTRAINT "events_rels_venues_fk" FOREIGN KEY ("venues_id") REFERENCES "public"."venues"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_events_v" ADD CONSTRAINT "_events_v_parent_id_events_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v" ADD CONSTRAINT "_events_v_version_hero_image_id_media_id_fk" FOREIGN KEY ("version_hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v" ADD CONSTRAINT "_events_v_version_seo_image_id_media_id_fk" FOREIGN KEY ("version_seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v_rels" ADD CONSTRAINT "_events_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_events_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_events_v_rels" ADD CONSTRAINT "_events_v_rels_venues_fk" FOREIGN KEY ("venues_id") REFERENCES "public"."venues"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "menus_sections_items" ADD CONSTRAINT "menus_sections_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."menus_sections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "menus_sections" ADD CONSTRAINT "menus_sections_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."menus"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "menus" ADD CONSTRAINT "menus_venue_id_venues_id_fk" FOREIGN KEY ("venue_id") REFERENCES "public"."venues"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "function_packages_inclusions" ADD CONSTRAINT "function_packages_inclusions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."function_packages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "function_packages" ADD CONSTRAINT "function_packages_venue_id_venues_id_fk" FOREIGN KEY ("venue_id") REFERENCES "public"."venues"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "function_packages" ADD CONSTRAINT "function_packages_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "function_packages" ADD CONSTRAINT "function_packages_brochure_id_media_id_fk" FOREIGN KEY ("brochure_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_function_packages_v_version_inclusions" ADD CONSTRAINT "_function_packages_v_version_inclusions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_function_packages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_function_packages_v" ADD CONSTRAINT "_function_packages_v_parent_id_function_packages_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."function_packages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_function_packages_v" ADD CONSTRAINT "_function_packages_v_version_venue_id_venues_id_fk" FOREIGN KEY ("version_venue_id") REFERENCES "public"."venues"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_function_packages_v" ADD CONSTRAINT "_function_packages_v_version_image_id_media_id_fk" FOREIGN KEY ("version_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_function_packages_v" ADD CONSTRAINT "_function_packages_v_version_brochure_id_media_id_fk" FOREIGN KEY ("version_brochure_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_hero_actions" ADD CONSTRAINT "pages_blocks_hero_actions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_hero" ADD CONSTRAINT "pages_blocks_hero_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_hero" ADD CONSTRAINT "pages_blocks_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_rich_text" ADD CONSTRAINT "pages_blocks_rich_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_venue_cards" ADD CONSTRAINT "pages_blocks_venue_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_beer_grid" ADD CONSTRAINT "pages_blocks_beer_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_event_list" ADD CONSTRAINT "pages_blocks_event_list_venue_id_venues_id_fk" FOREIGN KEY ("venue_id") REFERENCES "public"."venues"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_event_list" ADD CONSTRAINT "pages_blocks_event_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_tap_list" ADD CONSTRAINT "pages_blocks_tap_list_venue_id_venues_id_fk" FOREIGN KEY ("venue_id") REFERENCES "public"."venues"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_tap_list" ADD CONSTRAINT "pages_blocks_tap_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_faq_questions" ADD CONSTRAINT "pages_blocks_faq_questions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_faq" ADD CONSTRAINT "pages_blocks_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages" ADD CONSTRAINT "pages_seo_image_id_media_id_fk" FOREIGN KEY ("seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_venues_fk" FOREIGN KEY ("venues_id") REFERENCES "public"."venues"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_hero_actions" ADD CONSTRAINT "_pages_v_blocks_hero_actions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_hero" ADD CONSTRAINT "_pages_v_blocks_hero_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_hero" ADD CONSTRAINT "_pages_v_blocks_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_rich_text" ADD CONSTRAINT "_pages_v_blocks_rich_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_venue_cards" ADD CONSTRAINT "_pages_v_blocks_venue_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_beer_grid" ADD CONSTRAINT "_pages_v_blocks_beer_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_event_list" ADD CONSTRAINT "_pages_v_blocks_event_list_venue_id_venues_id_fk" FOREIGN KEY ("venue_id") REFERENCES "public"."venues"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_event_list" ADD CONSTRAINT "_pages_v_blocks_event_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_tap_list" ADD CONSTRAINT "_pages_v_blocks_tap_list_venue_id_venues_id_fk" FOREIGN KEY ("venue_id") REFERENCES "public"."venues"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_tap_list" ADD CONSTRAINT "_pages_v_blocks_tap_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_faq_questions" ADD CONSTRAINT "_pages_v_blocks_faq_questions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_faq" ADD CONSTRAINT "_pages_v_blocks_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_parent_id_pages_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_seo_image_id_media_id_fk" FOREIGN KEY ("version_seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_venues_fk" FOREIGN KEY ("venues_id") REFERENCES "public"."venues"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts" ADD CONSTRAINT "posts_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts" ADD CONSTRAINT "posts_seo_image_id_media_id_fk" FOREIGN KEY ("seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_parent_id_posts_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_version_hero_image_id_media_id_fk" FOREIGN KEY ("version_hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_version_seo_image_id_media_id_fk" FOREIGN KEY ("version_seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "users_roles" ADD CONSTRAINT "users_roles_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_venues_fk" FOREIGN KEY ("venues_id") REFERENCES "public"."venues"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_beers_fk" FOREIGN KEY ("beers_id") REFERENCES "public"."beers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_tap_lists_fk" FOREIGN KEY ("tap_lists_id") REFERENCES "public"."tap_lists"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_events_fk" FOREIGN KEY ("events_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_menus_fk" FOREIGN KEY ("menus_id") REFERENCES "public"."menus"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_function_packages_fk" FOREIGN KEY ("function_packages_id") REFERENCES "public"."function_packages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "settings_main_nav" ADD CONSTRAINT "settings_main_nav_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "settings" ADD CONSTRAINT "settings_default_image_id_media_id_fk" FOREIGN KEY ("default_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "venues_opening_hours_order_idx" ON "venues_opening_hours" USING btree ("_order");
  CREATE INDEX "venues_opening_hours_parent_id_idx" ON "venues_opening_hours" USING btree ("_parent_id");
  CREATE INDEX "venues_hours_overrides_order_idx" ON "venues_hours_overrides" USING btree ("_order");
  CREATE INDEX "venues_hours_overrides_parent_id_idx" ON "venues_hours_overrides" USING btree ("_parent_id");
  CREATE INDEX "venues_amenities_order_idx" ON "venues_amenities" USING btree ("order");
  CREATE INDEX "venues_amenities_parent_idx" ON "venues_amenities" USING btree ("parent_id");
  CREATE UNIQUE INDEX "venues_slug_idx" ON "venues" USING btree ("slug");
  CREATE INDEX "venues_hero_image_idx" ON "venues" USING btree ("hero_image_id");
  CREATE INDEX "venues_seo_seo_image_idx" ON "venues" USING btree ("seo_image_id");
  CREATE INDEX "venues_updated_at_idx" ON "venues" USING btree ("updated_at");
  CREATE INDEX "venues_created_at_idx" ON "venues" USING btree ("created_at");
  CREATE INDEX "venues__status_idx" ON "venues" USING btree ("_status");
  CREATE INDEX "venues_rels_order_idx" ON "venues_rels" USING btree ("order");
  CREATE INDEX "venues_rels_parent_idx" ON "venues_rels" USING btree ("parent_id");
  CREATE INDEX "venues_rels_path_idx" ON "venues_rels" USING btree ("path");
  CREATE INDEX "venues_rels_media_id_idx" ON "venues_rels" USING btree ("media_id");
  CREATE INDEX "_venues_v_version_opening_hours_order_idx" ON "_venues_v_version_opening_hours" USING btree ("_order");
  CREATE INDEX "_venues_v_version_opening_hours_parent_id_idx" ON "_venues_v_version_opening_hours" USING btree ("_parent_id");
  CREATE INDEX "_venues_v_version_hours_overrides_order_idx" ON "_venues_v_version_hours_overrides" USING btree ("_order");
  CREATE INDEX "_venues_v_version_hours_overrides_parent_id_idx" ON "_venues_v_version_hours_overrides" USING btree ("_parent_id");
  CREATE INDEX "_venues_v_version_amenities_order_idx" ON "_venues_v_version_amenities" USING btree ("order");
  CREATE INDEX "_venues_v_version_amenities_parent_idx" ON "_venues_v_version_amenities" USING btree ("parent_id");
  CREATE INDEX "_venues_v_parent_idx" ON "_venues_v" USING btree ("parent_id");
  CREATE INDEX "_venues_v_version_version_slug_idx" ON "_venues_v" USING btree ("version_slug");
  CREATE INDEX "_venues_v_version_version_hero_image_idx" ON "_venues_v" USING btree ("version_hero_image_id");
  CREATE INDEX "_venues_v_version_seo_version_seo_image_idx" ON "_venues_v" USING btree ("version_seo_image_id");
  CREATE INDEX "_venues_v_version_version_updated_at_idx" ON "_venues_v" USING btree ("version_updated_at");
  CREATE INDEX "_venues_v_version_version_created_at_idx" ON "_venues_v" USING btree ("version_created_at");
  CREATE INDEX "_venues_v_version_version__status_idx" ON "_venues_v" USING btree ("version__status");
  CREATE INDEX "_venues_v_created_at_idx" ON "_venues_v" USING btree ("created_at");
  CREATE INDEX "_venues_v_updated_at_idx" ON "_venues_v" USING btree ("updated_at");
  CREATE INDEX "_venues_v_latest_idx" ON "_venues_v" USING btree ("latest");
  CREATE INDEX "_venues_v_rels_order_idx" ON "_venues_v_rels" USING btree ("order");
  CREATE INDEX "_venues_v_rels_parent_idx" ON "_venues_v_rels" USING btree ("parent_id");
  CREATE INDEX "_venues_v_rels_path_idx" ON "_venues_v_rels" USING btree ("path");
  CREATE INDEX "_venues_v_rels_media_id_idx" ON "_venues_v_rels" USING btree ("media_id");
  CREATE INDEX "beers_ingredients_order_idx" ON "beers_ingredients" USING btree ("_order");
  CREATE INDEX "beers_ingredients_parent_id_idx" ON "beers_ingredients" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "beers_slug_idx" ON "beers" USING btree ("slug");
  CREATE INDEX "beers_can_artwork_idx" ON "beers" USING btree ("can_artwork_id");
  CREATE INDEX "beers_seo_seo_image_idx" ON "beers" USING btree ("seo_image_id");
  CREATE INDEX "beers_updated_at_idx" ON "beers" USING btree ("updated_at");
  CREATE INDEX "beers_created_at_idx" ON "beers" USING btree ("created_at");
  CREATE INDEX "beers__status_idx" ON "beers" USING btree ("_status");
  CREATE INDEX "beers_rels_order_idx" ON "beers_rels" USING btree ("order");
  CREATE INDEX "beers_rels_parent_idx" ON "beers_rels" USING btree ("parent_id");
  CREATE INDEX "beers_rels_path_idx" ON "beers_rels" USING btree ("path");
  CREATE INDEX "beers_rels_venues_id_idx" ON "beers_rels" USING btree ("venues_id");
  CREATE INDEX "_beers_v_version_ingredients_order_idx" ON "_beers_v_version_ingredients" USING btree ("_order");
  CREATE INDEX "_beers_v_version_ingredients_parent_id_idx" ON "_beers_v_version_ingredients" USING btree ("_parent_id");
  CREATE INDEX "_beers_v_parent_idx" ON "_beers_v" USING btree ("parent_id");
  CREATE INDEX "_beers_v_version_version_slug_idx" ON "_beers_v" USING btree ("version_slug");
  CREATE INDEX "_beers_v_version_version_can_artwork_idx" ON "_beers_v" USING btree ("version_can_artwork_id");
  CREATE INDEX "_beers_v_version_seo_version_seo_image_idx" ON "_beers_v" USING btree ("version_seo_image_id");
  CREATE INDEX "_beers_v_version_version_updated_at_idx" ON "_beers_v" USING btree ("version_updated_at");
  CREATE INDEX "_beers_v_version_version_created_at_idx" ON "_beers_v" USING btree ("version_created_at");
  CREATE INDEX "_beers_v_version_version__status_idx" ON "_beers_v" USING btree ("version__status");
  CREATE INDEX "_beers_v_created_at_idx" ON "_beers_v" USING btree ("created_at");
  CREATE INDEX "_beers_v_updated_at_idx" ON "_beers_v" USING btree ("updated_at");
  CREATE INDEX "_beers_v_latest_idx" ON "_beers_v" USING btree ("latest");
  CREATE INDEX "_beers_v_rels_order_idx" ON "_beers_v_rels" USING btree ("order");
  CREATE INDEX "_beers_v_rels_parent_idx" ON "_beers_v_rels" USING btree ("parent_id");
  CREATE INDEX "_beers_v_rels_path_idx" ON "_beers_v_rels" USING btree ("path");
  CREATE INDEX "_beers_v_rels_venues_id_idx" ON "_beers_v_rels" USING btree ("venues_id");
  CREATE INDEX "tap_lists_taps_order_idx" ON "tap_lists_taps" USING btree ("_order");
  CREATE INDEX "tap_lists_taps_parent_id_idx" ON "tap_lists_taps" USING btree ("_parent_id");
  CREATE INDEX "tap_lists_taps_beer_idx" ON "tap_lists_taps" USING btree ("beer_id");
  CREATE UNIQUE INDEX "tap_lists_venue_idx" ON "tap_lists" USING btree ("venue_id");
  CREATE INDEX "tap_lists_updated_at_idx" ON "tap_lists" USING btree ("updated_at");
  CREATE INDEX "tap_lists_created_at_idx" ON "tap_lists" USING btree ("created_at");
  CREATE UNIQUE INDEX "events_slug_idx" ON "events" USING btree ("slug");
  CREATE INDEX "events_hero_image_idx" ON "events" USING btree ("hero_image_id");
  CREATE INDEX "events_seo_seo_image_idx" ON "events" USING btree ("seo_image_id");
  CREATE INDEX "events_updated_at_idx" ON "events" USING btree ("updated_at");
  CREATE INDEX "events_created_at_idx" ON "events" USING btree ("created_at");
  CREATE INDEX "events__status_idx" ON "events" USING btree ("_status");
  CREATE INDEX "events_rels_order_idx" ON "events_rels" USING btree ("order");
  CREATE INDEX "events_rels_parent_idx" ON "events_rels" USING btree ("parent_id");
  CREATE INDEX "events_rels_path_idx" ON "events_rels" USING btree ("path");
  CREATE INDEX "events_rels_venues_id_idx" ON "events_rels" USING btree ("venues_id");
  CREATE INDEX "_events_v_parent_idx" ON "_events_v" USING btree ("parent_id");
  CREATE INDEX "_events_v_version_version_slug_idx" ON "_events_v" USING btree ("version_slug");
  CREATE INDEX "_events_v_version_version_hero_image_idx" ON "_events_v" USING btree ("version_hero_image_id");
  CREATE INDEX "_events_v_version_seo_version_seo_image_idx" ON "_events_v" USING btree ("version_seo_image_id");
  CREATE INDEX "_events_v_version_version_updated_at_idx" ON "_events_v" USING btree ("version_updated_at");
  CREATE INDEX "_events_v_version_version_created_at_idx" ON "_events_v" USING btree ("version_created_at");
  CREATE INDEX "_events_v_version_version__status_idx" ON "_events_v" USING btree ("version__status");
  CREATE INDEX "_events_v_created_at_idx" ON "_events_v" USING btree ("created_at");
  CREATE INDEX "_events_v_updated_at_idx" ON "_events_v" USING btree ("updated_at");
  CREATE INDEX "_events_v_latest_idx" ON "_events_v" USING btree ("latest");
  CREATE INDEX "_events_v_rels_order_idx" ON "_events_v_rels" USING btree ("order");
  CREATE INDEX "_events_v_rels_parent_idx" ON "_events_v_rels" USING btree ("parent_id");
  CREATE INDEX "_events_v_rels_path_idx" ON "_events_v_rels" USING btree ("path");
  CREATE INDEX "_events_v_rels_venues_id_idx" ON "_events_v_rels" USING btree ("venues_id");
  CREATE INDEX "menus_sections_items_order_idx" ON "menus_sections_items" USING btree ("_order");
  CREATE INDEX "menus_sections_items_parent_id_idx" ON "menus_sections_items" USING btree ("_parent_id");
  CREATE INDEX "menus_sections_order_idx" ON "menus_sections" USING btree ("_order");
  CREATE INDEX "menus_sections_parent_id_idx" ON "menus_sections" USING btree ("_parent_id");
  CREATE INDEX "menus_venue_idx" ON "menus" USING btree ("venue_id");
  CREATE INDEX "menus_meandu_id_idx" ON "menus" USING btree ("meandu_id");
  CREATE INDEX "menus_updated_at_idx" ON "menus" USING btree ("updated_at");
  CREATE INDEX "menus_created_at_idx" ON "menus" USING btree ("created_at");
  CREATE INDEX "function_packages_inclusions_order_idx" ON "function_packages_inclusions" USING btree ("_order");
  CREATE INDEX "function_packages_inclusions_parent_id_idx" ON "function_packages_inclusions" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "function_packages_slug_idx" ON "function_packages" USING btree ("slug");
  CREATE INDEX "function_packages_venue_idx" ON "function_packages" USING btree ("venue_id");
  CREATE INDEX "function_packages_image_idx" ON "function_packages" USING btree ("image_id");
  CREATE INDEX "function_packages_brochure_idx" ON "function_packages" USING btree ("brochure_id");
  CREATE INDEX "function_packages_updated_at_idx" ON "function_packages" USING btree ("updated_at");
  CREATE INDEX "function_packages_created_at_idx" ON "function_packages" USING btree ("created_at");
  CREATE INDEX "function_packages__status_idx" ON "function_packages" USING btree ("_status");
  CREATE INDEX "_function_packages_v_version_inclusions_order_idx" ON "_function_packages_v_version_inclusions" USING btree ("_order");
  CREATE INDEX "_function_packages_v_version_inclusions_parent_id_idx" ON "_function_packages_v_version_inclusions" USING btree ("_parent_id");
  CREATE INDEX "_function_packages_v_parent_idx" ON "_function_packages_v" USING btree ("parent_id");
  CREATE INDEX "_function_packages_v_version_version_slug_idx" ON "_function_packages_v" USING btree ("version_slug");
  CREATE INDEX "_function_packages_v_version_version_venue_idx" ON "_function_packages_v" USING btree ("version_venue_id");
  CREATE INDEX "_function_packages_v_version_version_image_idx" ON "_function_packages_v" USING btree ("version_image_id");
  CREATE INDEX "_function_packages_v_version_version_brochure_idx" ON "_function_packages_v" USING btree ("version_brochure_id");
  CREATE INDEX "_function_packages_v_version_version_updated_at_idx" ON "_function_packages_v" USING btree ("version_updated_at");
  CREATE INDEX "_function_packages_v_version_version_created_at_idx" ON "_function_packages_v" USING btree ("version_created_at");
  CREATE INDEX "_function_packages_v_version_version__status_idx" ON "_function_packages_v" USING btree ("version__status");
  CREATE INDEX "_function_packages_v_created_at_idx" ON "_function_packages_v" USING btree ("created_at");
  CREATE INDEX "_function_packages_v_updated_at_idx" ON "_function_packages_v" USING btree ("updated_at");
  CREATE INDEX "_function_packages_v_latest_idx" ON "_function_packages_v" USING btree ("latest");
  CREATE INDEX "pages_blocks_hero_actions_order_idx" ON "pages_blocks_hero_actions" USING btree ("_order");
  CREATE INDEX "pages_blocks_hero_actions_parent_id_idx" ON "pages_blocks_hero_actions" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_hero_order_idx" ON "pages_blocks_hero" USING btree ("_order");
  CREATE INDEX "pages_blocks_hero_parent_id_idx" ON "pages_blocks_hero" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_hero_path_idx" ON "pages_blocks_hero" USING btree ("_path");
  CREATE INDEX "pages_blocks_hero_image_idx" ON "pages_blocks_hero" USING btree ("image_id");
  CREATE INDEX "pages_blocks_rich_text_order_idx" ON "pages_blocks_rich_text" USING btree ("_order");
  CREATE INDEX "pages_blocks_rich_text_parent_id_idx" ON "pages_blocks_rich_text" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_rich_text_path_idx" ON "pages_blocks_rich_text" USING btree ("_path");
  CREATE INDEX "pages_blocks_venue_cards_order_idx" ON "pages_blocks_venue_cards" USING btree ("_order");
  CREATE INDEX "pages_blocks_venue_cards_parent_id_idx" ON "pages_blocks_venue_cards" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_venue_cards_path_idx" ON "pages_blocks_venue_cards" USING btree ("_path");
  CREATE INDEX "pages_blocks_beer_grid_order_idx" ON "pages_blocks_beer_grid" USING btree ("_order");
  CREATE INDEX "pages_blocks_beer_grid_parent_id_idx" ON "pages_blocks_beer_grid" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_beer_grid_path_idx" ON "pages_blocks_beer_grid" USING btree ("_path");
  CREATE INDEX "pages_blocks_event_list_order_idx" ON "pages_blocks_event_list" USING btree ("_order");
  CREATE INDEX "pages_blocks_event_list_parent_id_idx" ON "pages_blocks_event_list" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_event_list_path_idx" ON "pages_blocks_event_list" USING btree ("_path");
  CREATE INDEX "pages_blocks_event_list_venue_idx" ON "pages_blocks_event_list" USING btree ("venue_id");
  CREATE INDEX "pages_blocks_tap_list_order_idx" ON "pages_blocks_tap_list" USING btree ("_order");
  CREATE INDEX "pages_blocks_tap_list_parent_id_idx" ON "pages_blocks_tap_list" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_tap_list_path_idx" ON "pages_blocks_tap_list" USING btree ("_path");
  CREATE INDEX "pages_blocks_tap_list_venue_idx" ON "pages_blocks_tap_list" USING btree ("venue_id");
  CREATE INDEX "pages_blocks_faq_questions_order_idx" ON "pages_blocks_faq_questions" USING btree ("_order");
  CREATE INDEX "pages_blocks_faq_questions_parent_id_idx" ON "pages_blocks_faq_questions" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_faq_order_idx" ON "pages_blocks_faq" USING btree ("_order");
  CREATE INDEX "pages_blocks_faq_parent_id_idx" ON "pages_blocks_faq" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_faq_path_idx" ON "pages_blocks_faq" USING btree ("_path");
  CREATE UNIQUE INDEX "pages_slug_idx" ON "pages" USING btree ("slug");
  CREATE INDEX "pages_seo_seo_image_idx" ON "pages" USING btree ("seo_image_id");
  CREATE INDEX "pages_updated_at_idx" ON "pages" USING btree ("updated_at");
  CREATE INDEX "pages_created_at_idx" ON "pages" USING btree ("created_at");
  CREATE INDEX "pages__status_idx" ON "pages" USING btree ("_status");
  CREATE INDEX "pages_rels_order_idx" ON "pages_rels" USING btree ("order");
  CREATE INDEX "pages_rels_parent_idx" ON "pages_rels" USING btree ("parent_id");
  CREATE INDEX "pages_rels_path_idx" ON "pages_rels" USING btree ("path");
  CREATE INDEX "pages_rels_venues_id_idx" ON "pages_rels" USING btree ("venues_id");
  CREATE INDEX "_pages_v_blocks_hero_actions_order_idx" ON "_pages_v_blocks_hero_actions" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_hero_actions_parent_id_idx" ON "_pages_v_blocks_hero_actions" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_hero_order_idx" ON "_pages_v_blocks_hero" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_hero_parent_id_idx" ON "_pages_v_blocks_hero" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_hero_path_idx" ON "_pages_v_blocks_hero" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_hero_image_idx" ON "_pages_v_blocks_hero" USING btree ("image_id");
  CREATE INDEX "_pages_v_blocks_rich_text_order_idx" ON "_pages_v_blocks_rich_text" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_rich_text_parent_id_idx" ON "_pages_v_blocks_rich_text" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_rich_text_path_idx" ON "_pages_v_blocks_rich_text" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_venue_cards_order_idx" ON "_pages_v_blocks_venue_cards" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_venue_cards_parent_id_idx" ON "_pages_v_blocks_venue_cards" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_venue_cards_path_idx" ON "_pages_v_blocks_venue_cards" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_beer_grid_order_idx" ON "_pages_v_blocks_beer_grid" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_beer_grid_parent_id_idx" ON "_pages_v_blocks_beer_grid" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_beer_grid_path_idx" ON "_pages_v_blocks_beer_grid" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_event_list_order_idx" ON "_pages_v_blocks_event_list" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_event_list_parent_id_idx" ON "_pages_v_blocks_event_list" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_event_list_path_idx" ON "_pages_v_blocks_event_list" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_event_list_venue_idx" ON "_pages_v_blocks_event_list" USING btree ("venue_id");
  CREATE INDEX "_pages_v_blocks_tap_list_order_idx" ON "_pages_v_blocks_tap_list" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_tap_list_parent_id_idx" ON "_pages_v_blocks_tap_list" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_tap_list_path_idx" ON "_pages_v_blocks_tap_list" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_tap_list_venue_idx" ON "_pages_v_blocks_tap_list" USING btree ("venue_id");
  CREATE INDEX "_pages_v_blocks_faq_questions_order_idx" ON "_pages_v_blocks_faq_questions" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_faq_questions_parent_id_idx" ON "_pages_v_blocks_faq_questions" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_faq_order_idx" ON "_pages_v_blocks_faq" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_faq_parent_id_idx" ON "_pages_v_blocks_faq" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_faq_path_idx" ON "_pages_v_blocks_faq" USING btree ("_path");
  CREATE INDEX "_pages_v_parent_idx" ON "_pages_v" USING btree ("parent_id");
  CREATE INDEX "_pages_v_version_version_slug_idx" ON "_pages_v" USING btree ("version_slug");
  CREATE INDEX "_pages_v_version_seo_version_seo_image_idx" ON "_pages_v" USING btree ("version_seo_image_id");
  CREATE INDEX "_pages_v_version_version_updated_at_idx" ON "_pages_v" USING btree ("version_updated_at");
  CREATE INDEX "_pages_v_version_version_created_at_idx" ON "_pages_v" USING btree ("version_created_at");
  CREATE INDEX "_pages_v_version_version__status_idx" ON "_pages_v" USING btree ("version__status");
  CREATE INDEX "_pages_v_created_at_idx" ON "_pages_v" USING btree ("created_at");
  CREATE INDEX "_pages_v_updated_at_idx" ON "_pages_v" USING btree ("updated_at");
  CREATE INDEX "_pages_v_latest_idx" ON "_pages_v" USING btree ("latest");
  CREATE INDEX "_pages_v_rels_order_idx" ON "_pages_v_rels" USING btree ("order");
  CREATE INDEX "_pages_v_rels_parent_idx" ON "_pages_v_rels" USING btree ("parent_id");
  CREATE INDEX "_pages_v_rels_path_idx" ON "_pages_v_rels" USING btree ("path");
  CREATE INDEX "_pages_v_rels_venues_id_idx" ON "_pages_v_rels" USING btree ("venues_id");
  CREATE UNIQUE INDEX "posts_slug_idx" ON "posts" USING btree ("slug");
  CREATE INDEX "posts_hero_image_idx" ON "posts" USING btree ("hero_image_id");
  CREATE INDEX "posts_seo_seo_image_idx" ON "posts" USING btree ("seo_image_id");
  CREATE INDEX "posts_updated_at_idx" ON "posts" USING btree ("updated_at");
  CREATE INDEX "posts_created_at_idx" ON "posts" USING btree ("created_at");
  CREATE INDEX "posts__status_idx" ON "posts" USING btree ("_status");
  CREATE INDEX "_posts_v_parent_idx" ON "_posts_v" USING btree ("parent_id");
  CREATE INDEX "_posts_v_version_version_slug_idx" ON "_posts_v" USING btree ("version_slug");
  CREATE INDEX "_posts_v_version_version_hero_image_idx" ON "_posts_v" USING btree ("version_hero_image_id");
  CREATE INDEX "_posts_v_version_seo_version_seo_image_idx" ON "_posts_v" USING btree ("version_seo_image_id");
  CREATE INDEX "_posts_v_version_version_updated_at_idx" ON "_posts_v" USING btree ("version_updated_at");
  CREATE INDEX "_posts_v_version_version_created_at_idx" ON "_posts_v" USING btree ("version_created_at");
  CREATE INDEX "_posts_v_version_version__status_idx" ON "_posts_v" USING btree ("version__status");
  CREATE INDEX "_posts_v_created_at_idx" ON "_posts_v" USING btree ("created_at");
  CREATE INDEX "_posts_v_updated_at_idx" ON "_posts_v" USING btree ("updated_at");
  CREATE INDEX "_posts_v_latest_idx" ON "_posts_v" USING btree ("latest");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "media_sizes_thumbnail_sizes_thumbnail_filename_idx" ON "media" USING btree ("sizes_thumbnail_filename");
  CREATE INDEX "media_sizes_card_sizes_card_filename_idx" ON "media" USING btree ("sizes_card_filename");
  CREATE INDEX "media_sizes_hero_sizes_hero_filename_idx" ON "media" USING btree ("sizes_hero_filename");
  CREATE INDEX "media_sizes_square_sizes_square_filename_idx" ON "media" USING btree ("sizes_square_filename");
  CREATE INDEX "users_roles_order_idx" ON "users_roles" USING btree ("order");
  CREATE INDEX "users_roles_parent_idx" ON "users_roles" USING btree ("parent_id");
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_venues_id_idx" ON "payload_locked_documents_rels" USING btree ("venues_id");
  CREATE INDEX "payload_locked_documents_rels_beers_id_idx" ON "payload_locked_documents_rels" USING btree ("beers_id");
  CREATE INDEX "payload_locked_documents_rels_tap_lists_id_idx" ON "payload_locked_documents_rels" USING btree ("tap_lists_id");
  CREATE INDEX "payload_locked_documents_rels_events_id_idx" ON "payload_locked_documents_rels" USING btree ("events_id");
  CREATE INDEX "payload_locked_documents_rels_menus_id_idx" ON "payload_locked_documents_rels" USING btree ("menus_id");
  CREATE INDEX "payload_locked_documents_rels_function_packages_id_idx" ON "payload_locked_documents_rels" USING btree ("function_packages_id");
  CREATE INDEX "payload_locked_documents_rels_pages_id_idx" ON "payload_locked_documents_rels" USING btree ("pages_id");
  CREATE INDEX "payload_locked_documents_rels_posts_id_idx" ON "payload_locked_documents_rels" USING btree ("posts_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE INDEX "settings_main_nav_order_idx" ON "settings_main_nav" USING btree ("_order");
  CREATE INDEX "settings_main_nav_parent_id_idx" ON "settings_main_nav" USING btree ("_parent_id");
  CREATE INDEX "settings_default_image_idx" ON "settings" USING btree ("default_image_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "venues_opening_hours" CASCADE;
  DROP TABLE "venues_hours_overrides" CASCADE;
  DROP TABLE "venues_amenities" CASCADE;
  DROP TABLE "venues" CASCADE;
  DROP TABLE "venues_rels" CASCADE;
  DROP TABLE "_venues_v_version_opening_hours" CASCADE;
  DROP TABLE "_venues_v_version_hours_overrides" CASCADE;
  DROP TABLE "_venues_v_version_amenities" CASCADE;
  DROP TABLE "_venues_v" CASCADE;
  DROP TABLE "_venues_v_rels" CASCADE;
  DROP TABLE "beers_ingredients" CASCADE;
  DROP TABLE "beers" CASCADE;
  DROP TABLE "beers_rels" CASCADE;
  DROP TABLE "_beers_v_version_ingredients" CASCADE;
  DROP TABLE "_beers_v" CASCADE;
  DROP TABLE "_beers_v_rels" CASCADE;
  DROP TABLE "tap_lists_taps" CASCADE;
  DROP TABLE "tap_lists" CASCADE;
  DROP TABLE "events" CASCADE;
  DROP TABLE "events_rels" CASCADE;
  DROP TABLE "_events_v" CASCADE;
  DROP TABLE "_events_v_rels" CASCADE;
  DROP TABLE "menus_sections_items" CASCADE;
  DROP TABLE "menus_sections" CASCADE;
  DROP TABLE "menus" CASCADE;
  DROP TABLE "function_packages_inclusions" CASCADE;
  DROP TABLE "function_packages" CASCADE;
  DROP TABLE "_function_packages_v_version_inclusions" CASCADE;
  DROP TABLE "_function_packages_v" CASCADE;
  DROP TABLE "pages_blocks_hero_actions" CASCADE;
  DROP TABLE "pages_blocks_hero" CASCADE;
  DROP TABLE "pages_blocks_rich_text" CASCADE;
  DROP TABLE "pages_blocks_venue_cards" CASCADE;
  DROP TABLE "pages_blocks_beer_grid" CASCADE;
  DROP TABLE "pages_blocks_event_list" CASCADE;
  DROP TABLE "pages_blocks_tap_list" CASCADE;
  DROP TABLE "pages_blocks_faq_questions" CASCADE;
  DROP TABLE "pages_blocks_faq" CASCADE;
  DROP TABLE "pages" CASCADE;
  DROP TABLE "pages_rels" CASCADE;
  DROP TABLE "_pages_v_blocks_hero_actions" CASCADE;
  DROP TABLE "_pages_v_blocks_hero" CASCADE;
  DROP TABLE "_pages_v_blocks_rich_text" CASCADE;
  DROP TABLE "_pages_v_blocks_venue_cards" CASCADE;
  DROP TABLE "_pages_v_blocks_beer_grid" CASCADE;
  DROP TABLE "_pages_v_blocks_event_list" CASCADE;
  DROP TABLE "_pages_v_blocks_tap_list" CASCADE;
  DROP TABLE "_pages_v_blocks_faq_questions" CASCADE;
  DROP TABLE "_pages_v_blocks_faq" CASCADE;
  DROP TABLE "_pages_v" CASCADE;
  DROP TABLE "_pages_v_rels" CASCADE;
  DROP TABLE "posts" CASCADE;
  DROP TABLE "_posts_v" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "users_roles" CASCADE;
  DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "settings_main_nav" CASCADE;
  DROP TABLE "settings" CASCADE;
  DROP TYPE "public"."enum_venues_opening_hours_day";
  DROP TYPE "public"."enum_venues_amenities";
  DROP TYPE "public"."enum_venues_status";
  DROP TYPE "public"."enum__venues_v_version_opening_hours_day";
  DROP TYPE "public"."enum__venues_v_version_amenities";
  DROP TYPE "public"."enum__venues_v_version_status";
  DROP TYPE "public"."enum_beers_category";
  DROP TYPE "public"."enum_beers_status";
  DROP TYPE "public"."enum__beers_v_version_category";
  DROP TYPE "public"."enum__beers_v_version_status";
  DROP TYPE "public"."enum_tap_lists_source";
  DROP TYPE "public"."enum_events_recurrence";
  DROP TYPE "public"."enum_events_category";
  DROP TYPE "public"."enum_events_status";
  DROP TYPE "public"."enum__events_v_version_recurrence";
  DROP TYPE "public"."enum__events_v_version_category";
  DROP TYPE "public"."enum__events_v_version_status";
  DROP TYPE "public"."enum_function_packages_seating";
  DROP TYPE "public"."enum_function_packages_status";
  DROP TYPE "public"."enum__function_packages_v_version_seating";
  DROP TYPE "public"."enum__function_packages_v_version_status";
  DROP TYPE "public"."enum_pages_blocks_beer_grid_filter_by";
  DROP TYPE "public"."enum_pages_status";
  DROP TYPE "public"."enum__pages_v_blocks_beer_grid_filter_by";
  DROP TYPE "public"."enum__pages_v_version_status";
  DROP TYPE "public"."enum_posts_status";
  DROP TYPE "public"."enum__posts_v_version_status";
  DROP TYPE "public"."enum_users_roles";`)
}
