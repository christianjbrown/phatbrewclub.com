import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Venue intro becomes plain text.
 *
 * The column was jsonb behind a Lexical editor, but the only thing ever
 * written into it was a plain string, so the admin refused to open the field:
 * "the value passed to the Lexical editor is not an object". The venue edit
 * screen was unusable as a result.
 *
 * `#>> '{}'` unwraps a jsonb string scalar to text. It is guarded on
 * jsonb_typeof so that a genuine Lexical node tree, if one ever got in, is
 * dropped rather than converted into a page full of visible JSON — losing a
 * blurb is recoverable, publishing braces to the venue page is not.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "venues" ALTER COLUMN "intro" TYPE varchar
    USING CASE WHEN jsonb_typeof("intro") = 'string' THEN "intro" #>> '{}' END;
  ALTER TABLE "_venues_v" ALTER COLUMN "version_intro" TYPE varchar
    USING CASE WHEN jsonb_typeof("version_intro") = 'string' THEN "version_intro" #>> '{}' END;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "venues" ALTER COLUMN "intro" TYPE jsonb USING to_jsonb("intro");
  ALTER TABLE "_venues_v" ALTER COLUMN "version_intro" TYPE jsonb USING to_jsonb("version_intro");`)
}
