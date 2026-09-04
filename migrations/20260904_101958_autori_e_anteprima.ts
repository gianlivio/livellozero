import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "autori" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"nome" varchar NOT NULL,
  	"bio" varchar,
  	"foto_id" integer,
  	"instagram" varchar,
  	"email" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "articoli" ADD COLUMN "autore_id" integer;
  ALTER TABLE "_articoli_v" ADD COLUMN "version_autore_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "autori_id" integer;
  ALTER TABLE "autori" ADD CONSTRAINT "autori_foto_id_media_id_fk" FOREIGN KEY ("foto_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "autori_foto_idx" ON "autori" USING btree ("foto_id");
  CREATE INDEX "autori_updated_at_idx" ON "autori" USING btree ("updated_at");
  CREATE INDEX "autori_created_at_idx" ON "autori" USING btree ("created_at");
  ALTER TABLE "articoli" ADD CONSTRAINT "articoli_autore_id_autori_id_fk" FOREIGN KEY ("autore_id") REFERENCES "public"."autori"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_articoli_v" ADD CONSTRAINT "_articoli_v_version_autore_id_autori_id_fk" FOREIGN KEY ("version_autore_id") REFERENCES "public"."autori"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_autori_fk" FOREIGN KEY ("autori_id") REFERENCES "public"."autori"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "articoli_autore_idx" ON "articoli" USING btree ("autore_id");
  CREATE INDEX "_articoli_v_version_version_autore_idx" ON "_articoli_v" USING btree ("version_autore_id");
  CREATE INDEX "payload_locked_documents_rels_autori_id_idx" ON "payload_locked_documents_rels" USING btree ("autori_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "autori" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "autori" CASCADE;
  ALTER TABLE "articoli" DROP CONSTRAINT "articoli_autore_id_autori_id_fk";
  
  ALTER TABLE "_articoli_v" DROP CONSTRAINT "_articoli_v_version_autore_id_autori_id_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_autori_fk";
  
  DROP INDEX "articoli_autore_idx";
  DROP INDEX "_articoli_v_version_version_autore_idx";
  DROP INDEX "payload_locked_documents_rels_autori_id_idx";
  ALTER TABLE "articoli" DROP COLUMN "autore_id";
  ALTER TABLE "_articoli_v" DROP COLUMN "version_autore_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "autori_id";`)
}
