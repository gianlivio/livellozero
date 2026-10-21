import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "chi_sono_locales" ALTER COLUMN "titolo" DROP DEFAULT;
  ALTER TABLE "progetto_locales" ALTER COLUMN "titolo" DROP DEFAULT;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "chi_sono_locales" ALTER COLUMN "titolo" SET DEFAULT 'Chi sono';
  ALTER TABLE "progetto_locales" ALTER COLUMN "titolo" SET DEFAULT 'Il progetto';`)
}
