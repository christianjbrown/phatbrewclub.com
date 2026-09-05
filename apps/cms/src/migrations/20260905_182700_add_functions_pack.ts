import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "venues" ADD COLUMN "functions_pack_id" integer;
  ALTER TABLE "_venues_v" ADD COLUMN "version_functions_pack_id" integer;
  ALTER TABLE "venues" ADD CONSTRAINT "venues_functions_pack_id_media_id_fk" FOREIGN KEY ("functions_pack_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_venues_v" ADD CONSTRAINT "_venues_v_version_functions_pack_id_media_id_fk" FOREIGN KEY ("version_functions_pack_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "venues_functions_pack_idx" ON "venues" USING btree ("functions_pack_id");
  CREATE INDEX "_venues_v_version_version_functions_pack_idx" ON "_venues_v" USING btree ("version_functions_pack_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "venues" DROP CONSTRAINT "venues_functions_pack_id_media_id_fk";
  
  ALTER TABLE "_venues_v" DROP CONSTRAINT "_venues_v_version_functions_pack_id_media_id_fk";
  
  DROP INDEX "venues_functions_pack_idx";
  DROP INDEX "_venues_v_version_version_functions_pack_idx";
  ALTER TABLE "venues" DROP COLUMN "functions_pack_id";
  ALTER TABLE "_venues_v" DROP COLUMN "version_functions_pack_id";`)
}
