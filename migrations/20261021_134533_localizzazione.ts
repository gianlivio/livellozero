import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."_locales" AS ENUM('it', 'en');
  CREATE TYPE "public"."enum__articoli_v_published_locale" AS ENUM('it', 'en');
  CREATE TABLE "autori_locales" (
  	"bio" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "articoli_locales" (
  	"titolo" varchar,
  	"slug" varchar,
  	"sommario" varchar,
  	"titolo_google" varchar,
  	"descrizione_google" varchar,
  	"corpo" jsonb,
  	"minuti" numeric,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_articoli_v_locales" (
  	"version_titolo" varchar,
  	"version_slug" varchar,
  	"version_sommario" varchar,
  	"version_titolo_google" varchar,
  	"version_descrizione_google" varchar,
  	"version_corpo" jsonb,
  	"version_minuti" numeric,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "chi_sono_locales" (
  	"titolo" varchar DEFAULT 'Chi sono' NOT NULL,
  	"testo" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "progetto_locales" (
  	"titolo" varchar DEFAULT 'Il progetto' NOT NULL,
  	"testo" jsonb,
  	"donazioni_testo" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "categorie_voci_locales" (
  	"descrizione" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  DROP INDEX "articoli_slug_idx";
  DROP INDEX "_articoli_v_version_version_slug_idx";
  ALTER TABLE "articoli" ADD COLUMN "inglese_visibile" boolean DEFAULT false;
  ALTER TABLE "_articoli_v" ADD COLUMN "version_inglese_visibile" boolean DEFAULT false;
  ALTER TABLE "_articoli_v" ADD COLUMN "snapshot" boolean;
  ALTER TABLE "_articoli_v" ADD COLUMN "published_locale" "enum__articoli_v_published_locale";
  ALTER TABLE "autori_locales" ADD CONSTRAINT "autori_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."autori"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articoli_locales" ADD CONSTRAINT "articoli_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articoli"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articoli_v_locales" ADD CONSTRAINT "_articoli_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_articoli_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "chi_sono_locales" ADD CONSTRAINT "chi_sono_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."chi_sono"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "progetto_locales" ADD CONSTRAINT "progetto_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."progetto"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "categorie_voci_locales" ADD CONSTRAINT "categorie_voci_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."categorie_voci"("id") ON DELETE cascade ON UPDATE no action;
  CREATE UNIQUE INDEX "autori_locales_locale_parent_id_unique" ON "autori_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "articoli_slug_idx" ON "articoli_locales" USING btree ("slug","_locale");
  CREATE UNIQUE INDEX "articoli_locales_locale_parent_id_unique" ON "articoli_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_articoli_v_version_version_slug_idx" ON "_articoli_v_locales" USING btree ("version_slug","_locale");
  CREATE UNIQUE INDEX "_articoli_v_locales_locale_parent_id_unique" ON "_articoli_v_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "chi_sono_locales_locale_parent_id_unique" ON "chi_sono_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "progetto_locales_locale_parent_id_unique" ON "progetto_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "categorie_voci_locales_locale_parent_id_unique" ON "categorie_voci_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_articoli_v_snapshot_idx" ON "_articoli_v" USING btree ("snapshot");
  CREATE INDEX "_articoli_v_published_locale_idx" ON "_articoli_v" USING btree ("published_locale");`)

  // Scritto a mano: la migrazione generata crea le tabelle per lingua e poi
  // cancella le colonne, senza copiare niente. Qui tutto quello che c'e' oggi
  // passa nelle tabelle _locales come italiano, prima che le colonne spariscano.
  // Gli indici unici esistono gia': uno slug doppio farebbe fallire tutto.
  await db.execute(sql`
  INSERT INTO "articoli_locales" ("titolo", "slug", "sommario", "titolo_google", "descrizione_google", "corpo", "minuti", "_locale", "_parent_id")
    SELECT "titolo", "slug", "sommario", "titolo_google", "descrizione_google", "corpo", "minuti", 'it', "id" FROM "articoli";
  INSERT INTO "_articoli_v_locales" ("version_titolo", "version_slug", "version_sommario", "version_titolo_google", "version_descrizione_google", "version_corpo", "version_minuti", "_locale", "_parent_id")
    SELECT "version_titolo", "version_slug", "version_sommario", "version_titolo_google", "version_descrizione_google", "version_corpo", "version_minuti", 'it', "id" FROM "_articoli_v";
  INSERT INTO "autori_locales" ("bio", "_locale", "_parent_id")
    SELECT "bio", 'it', "id" FROM "autori";
  INSERT INTO "chi_sono_locales" ("titolo", "testo", "_locale", "_parent_id")
    SELECT "titolo", "testo", 'it', "id" FROM "chi_sono";
  INSERT INTO "progetto_locales" ("titolo", "testo", "donazioni_testo", "_locale", "_parent_id")
    SELECT "titolo", "testo", "donazioni_testo", 'it', "id" FROM "progetto";
  INSERT INTO "categorie_voci_locales" ("descrizione", "_locale", "_parent_id")
    SELECT "descrizione", 'it', "id" FROM "categorie_voci";`)

  await db.execute(sql`
  ALTER TABLE "autori" DROP COLUMN "bio";
  ALTER TABLE "articoli" DROP COLUMN "titolo";
  ALTER TABLE "articoli" DROP COLUMN "slug";
  ALTER TABLE "articoli" DROP COLUMN "sommario";
  ALTER TABLE "articoli" DROP COLUMN "titolo_google";
  ALTER TABLE "articoli" DROP COLUMN "descrizione_google";
  ALTER TABLE "articoli" DROP COLUMN "corpo";
  ALTER TABLE "articoli" DROP COLUMN "minuti";
  ALTER TABLE "_articoli_v" DROP COLUMN "version_titolo";
  ALTER TABLE "_articoli_v" DROP COLUMN "version_slug";
  ALTER TABLE "_articoli_v" DROP COLUMN "version_sommario";
  ALTER TABLE "_articoli_v" DROP COLUMN "version_titolo_google";
  ALTER TABLE "_articoli_v" DROP COLUMN "version_descrizione_google";
  ALTER TABLE "_articoli_v" DROP COLUMN "version_corpo";
  ALTER TABLE "_articoli_v" DROP COLUMN "version_minuti";
  ALTER TABLE "chi_sono" DROP COLUMN "titolo";
  ALTER TABLE "chi_sono" DROP COLUMN "testo";
  ALTER TABLE "progetto" DROP COLUMN "titolo";
  ALTER TABLE "progetto" DROP COLUMN "testo";
  ALTER TABLE "progetto" DROP COLUMN "donazioni_testo";
  ALTER TABLE "categorie_voci" DROP COLUMN "descrizione";`)
}

/**
 * Riscritto a mano. Quello generato cancellava le tabelle per lingua prima di
 * aver ricreato le colonne, e i testi andavano persi. Qui l'ordine e':
 * colonne di nuovo al loro posto, testi italiani ricopiati, poi via le tabelle
 * per lingua. I testi inglesi, se ce ne sono, si perdono: prima di questa
 * migrazione non c'era posto dove tenerli.
 */
export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "autori" ADD COLUMN "bio" varchar;
  ALTER TABLE "articoli" ADD COLUMN "titolo" varchar;
  ALTER TABLE "articoli" ADD COLUMN "slug" varchar;
  ALTER TABLE "articoli" ADD COLUMN "sommario" varchar;
  ALTER TABLE "articoli" ADD COLUMN "titolo_google" varchar;
  ALTER TABLE "articoli" ADD COLUMN "descrizione_google" varchar;
  ALTER TABLE "articoli" ADD COLUMN "corpo" jsonb;
  ALTER TABLE "articoli" ADD COLUMN "minuti" numeric;
  ALTER TABLE "_articoli_v" ADD COLUMN "version_titolo" varchar;
  ALTER TABLE "_articoli_v" ADD COLUMN "version_slug" varchar;
  ALTER TABLE "_articoli_v" ADD COLUMN "version_sommario" varchar;
  ALTER TABLE "_articoli_v" ADD COLUMN "version_titolo_google" varchar;
  ALTER TABLE "_articoli_v" ADD COLUMN "version_descrizione_google" varchar;
  ALTER TABLE "_articoli_v" ADD COLUMN "version_corpo" jsonb;
  ALTER TABLE "_articoli_v" ADD COLUMN "version_minuti" numeric;
  ALTER TABLE "chi_sono" ADD COLUMN "titolo" varchar DEFAULT 'Chi sono' NOT NULL;
  ALTER TABLE "chi_sono" ADD COLUMN "testo" jsonb;
  ALTER TABLE "progetto" ADD COLUMN "titolo" varchar DEFAULT 'Il progetto' NOT NULL;
  ALTER TABLE "progetto" ADD COLUMN "testo" jsonb;
  ALTER TABLE "progetto" ADD COLUMN "donazioni_testo" varchar;
  ALTER TABLE "categorie_voci" ADD COLUMN "descrizione" varchar;`)

  await db.execute(sql`
  UPDATE "articoli" AS a SET
    "titolo" = l."titolo", "slug" = l."slug", "sommario" = l."sommario",
    "titolo_google" = l."titolo_google", "descrizione_google" = l."descrizione_google",
    "corpo" = l."corpo", "minuti" = l."minuti"
    FROM "articoli_locales" AS l WHERE l."_parent_id" = a."id" AND l."_locale" = 'it';
  UPDATE "_articoli_v" AS v SET
    "version_titolo" = l."version_titolo", "version_slug" = l."version_slug", "version_sommario" = l."version_sommario",
    "version_titolo_google" = l."version_titolo_google", "version_descrizione_google" = l."version_descrizione_google",
    "version_corpo" = l."version_corpo", "version_minuti" = l."version_minuti"
    FROM "_articoli_v_locales" AS l WHERE l."_parent_id" = v."id" AND l."_locale" = 'it';
  UPDATE "autori" AS a SET "bio" = l."bio"
    FROM "autori_locales" AS l WHERE l."_parent_id" = a."id" AND l."_locale" = 'it';
  UPDATE "chi_sono" AS c SET "titolo" = l."titolo", "testo" = l."testo"
    FROM "chi_sono_locales" AS l WHERE l."_parent_id" = c."id" AND l."_locale" = 'it';
  UPDATE "progetto" AS p SET "titolo" = l."titolo", "testo" = l."testo", "donazioni_testo" = l."donazioni_testo"
    FROM "progetto_locales" AS l WHERE l."_parent_id" = p."id" AND l."_locale" = 'it';
  UPDATE "categorie_voci" AS c SET "descrizione" = l."descrizione"
    FROM "categorie_voci_locales" AS l WHERE l."_parent_id" = c."id" AND l."_locale" = 'it';`)

  // articoli_slug_idx sta sulla tabella per lingua: va via con lei, e solo
  // dopo si puo' ricreare con lo stesso nome sulla tabella articoli.
  await db.execute(sql`
  ALTER TABLE "autori_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "articoli_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_articoli_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "chi_sono_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "progetto_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "categorie_voci_locales" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "autori_locales" CASCADE;
  DROP TABLE "articoli_locales" CASCADE;
  DROP TABLE "_articoli_v_locales" CASCADE;
  DROP TABLE "chi_sono_locales" CASCADE;
  DROP TABLE "progetto_locales" CASCADE;
  DROP TABLE "categorie_voci_locales" CASCADE;
  DROP INDEX "_articoli_v_snapshot_idx";
  DROP INDEX "_articoli_v_published_locale_idx";
  CREATE UNIQUE INDEX "articoli_slug_idx" ON "articoli" USING btree ("slug");
  CREATE INDEX "_articoli_v_version_version_slug_idx" ON "_articoli_v" USING btree ("version_slug");
  ALTER TABLE "articoli" DROP COLUMN "inglese_visibile";
  ALTER TABLE "_articoli_v" DROP COLUMN "version_inglese_visibile";
  ALTER TABLE "_articoli_v" DROP COLUMN "snapshot";
  ALTER TABLE "_articoli_v" DROP COLUMN "published_locale";
  DROP TYPE "public"."_locales";
  DROP TYPE "public"."enum__articoli_v_published_locale";`)
}
