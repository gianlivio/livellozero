import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "articoli" ADD COLUMN "titolo_google" varchar;
  ALTER TABLE "articoli" ADD COLUMN "descrizione_google" varchar;
  ALTER TABLE "_articoli_v" ADD COLUMN "version_titolo_google" varchar;
  ALTER TABLE "_articoli_v" ADD COLUMN "version_descrizione_google" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "articoli" DROP COLUMN "titolo_google";
  ALTER TABLE "articoli" DROP COLUMN "descrizione_google";
  ALTER TABLE "_articoli_v" DROP COLUMN "version_titolo_google";
  ALTER TABLE "_articoli_v" DROP COLUMN "version_descrizione_google";`)
}
