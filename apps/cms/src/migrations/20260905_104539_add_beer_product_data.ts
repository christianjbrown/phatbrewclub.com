import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_beers_allergens" AS ENUM('Lactose', 'Gluten', 'Wheat', 'Nuts', 'Soy');
  CREATE TYPE "public"."enum__beers_v_version_allergens" AS ENUM('Lactose', 'Gluten', 'Wheat', 'Nuts', 'Soy');
  CREATE TABLE "beers_allergens" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_beers_allergens",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_beers_v_version_allergens" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__beers_v_version_allergens",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  ALTER TABLE "beers" ADD COLUMN "price" numeric;
  ALTER TABLE "beers" ADD COLUMN "pack_size" varchar;
  ALTER TABLE "beers" ADD COLUMN "shop_url" varchar;
  ALTER TABLE "beers_rels" ADD COLUMN "media_id" integer;
  ALTER TABLE "_beers_v" ADD COLUMN "version_price" numeric;
  ALTER TABLE "_beers_v" ADD COLUMN "version_pack_size" varchar;
  ALTER TABLE "_beers_v" ADD COLUMN "version_shop_url" varchar;
  ALTER TABLE "_beers_v_rels" ADD COLUMN "media_id" integer;
  ALTER TABLE "beers_allergens" ADD CONSTRAINT "beers_allergens_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."beers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_beers_v_version_allergens" ADD CONSTRAINT "_beers_v_version_allergens_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_beers_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "beers_allergens_order_idx" ON "beers_allergens" USING btree ("order");
  CREATE INDEX "beers_allergens_parent_idx" ON "beers_allergens" USING btree ("parent_id");
  CREATE INDEX "_beers_v_version_allergens_order_idx" ON "_beers_v_version_allergens" USING btree ("order");
  CREATE INDEX "_beers_v_version_allergens_parent_idx" ON "_beers_v_version_allergens" USING btree ("parent_id");
  ALTER TABLE "beers_rels" ADD CONSTRAINT "beers_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_beers_v_rels" ADD CONSTRAINT "_beers_v_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "beers_rels_media_id_idx" ON "beers_rels" USING btree ("media_id");
  CREATE INDEX "_beers_v_rels_media_id_idx" ON "_beers_v_rels" USING btree ("media_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "beers_allergens" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_beers_v_version_allergens" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "beers_allergens" CASCADE;
  DROP TABLE "_beers_v_version_allergens" CASCADE;
  ALTER TABLE "beers_rels" DROP CONSTRAINT "beers_rels_media_fk";
  
  ALTER TABLE "_beers_v_rels" DROP CONSTRAINT "_beers_v_rels_media_fk";
  
  DROP INDEX "beers_rels_media_id_idx";
  DROP INDEX "_beers_v_rels_media_id_idx";
  ALTER TABLE "beers" DROP COLUMN "price";
  ALTER TABLE "beers" DROP COLUMN "pack_size";
  ALTER TABLE "beers" DROP COLUMN "shop_url";
  ALTER TABLE "beers_rels" DROP COLUMN "media_id";
  ALTER TABLE "_beers_v" DROP COLUMN "version_price";
  ALTER TABLE "_beers_v" DROP COLUMN "version_pack_size";
  ALTER TABLE "_beers_v" DROP COLUMN "version_shop_url";
  ALTER TABLE "_beers_v_rels" DROP COLUMN "media_id";
  DROP TYPE "public"."enum_beers_allergens";
  DROP TYPE "public"."enum__beers_v_version_allergens";`)
}
