import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Le descrizioni che prima stavano scritte in lib/articoli.ts, cosi' dopo il
 * rilascio le pagine categoria non si trovano senza. Da qui in avanti si
 * cambiano dal pannello. L'ordine e' quello del menu.
 */
const voci = [
  {
    chiave: 'approfondimenti' as const,
    descrizione:
      "Come nascono i giochi: l'idea iniziale, lo sviluppo, le cose cambiate lungo la strada.",
  },
  {
    chiave: 'recensioni' as const,
    descrizione: 'Giudizi personali, senza voti numerici.',
  },
  {
    chiave: 'consigli' as const,
    descrizione: 'Cosa giocare dopo un certo titolo, o se cerchi una certa atmosfera.',
  },
  {
    chiave: 'riflessioni' as const,
    descrizione: 'Ragionamenti su come stanno cambiando i videogiochi e chi li fa.',
  },
  {
    chiave: 'classifiche' as const,
    descrizione: 'Liste ragionate su una saga, un autore, un genere.',
  },
]

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_categorie_voci_chiave" AS ENUM('approfondimenti', 'recensioni', 'consigli', 'riflessioni', 'classifiche');
  CREATE TABLE "categorie_voci" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"chiave" "enum_categorie_voci_chiave" NOT NULL,
  	"descrizione" varchar
  );
  
  CREATE TABLE "categorie" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "categorie_voci" ADD CONSTRAINT "categorie_voci_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."categorie"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "categorie_voci_order_idx" ON "categorie_voci" USING btree ("_order");
  CREATE INDEX "categorie_voci_parent_id_idx" ON "categorie_voci" USING btree ("_parent_id");`)

  await payload.updateGlobal({
    slug: 'categorie',
    data: { voci },
    depth: 0,
    req,
  })
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "categorie_voci" CASCADE;
  DROP TABLE "categorie" CASCADE;
  DROP TYPE "public"."enum_categorie_voci_chiave";`)
}
