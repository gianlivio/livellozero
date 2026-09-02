import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_articoli_categoria" AS ENUM('approfondimenti', 'recensioni', 'consigli', 'riflessioni', 'classifiche');
  CREATE TYPE "public"."enum_articoli_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__articoli_v_version_categoria" AS ENUM('approfondimenti', 'recensioni', 'consigli', 'riflessioni', 'classifiche');
  CREATE TYPE "public"."enum__articoli_v_version_status" AS ENUM('draft', 'published');
  CREATE TABLE "utenti_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "utenti" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"nome" varchar NOT NULL,
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
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar NOT NULL,
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
  	"sizes_card_url" varchar,
  	"sizes_card_width" numeric,
  	"sizes_card_height" numeric,
  	"sizes_card_mime_type" varchar,
  	"sizes_card_filesize" numeric,
  	"sizes_card_filename" varchar,
  	"sizes_apertura_url" varchar,
  	"sizes_apertura_width" numeric,
  	"sizes_apertura_height" numeric,
  	"sizes_apertura_mime_type" varchar,
  	"sizes_apertura_filesize" numeric,
  	"sizes_apertura_filename" varchar
  );
  
  CREATE TABLE "articoli" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"titolo" varchar,
  	"slug" varchar,
  	"categoria" "enum_articoli_categoria",
  	"sommario" varchar,
  	"copertina_id" integer,
  	"corpo" jsonb,
  	"data_pubblicazione" timestamp(3) with time zone,
  	"minuti" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_articoli_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_articoli_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_titolo" varchar,
  	"version_slug" varchar,
  	"version_categoria" "enum__articoli_v_version_categoria",
  	"version_sommario" varchar,
  	"version_copertina_id" integer,
  	"version_corpo" jsonb,
  	"version_data_pubblicazione" timestamp(3) with time zone,
  	"version_minuti" numeric,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__articoli_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
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
  	"utenti_id" integer,
  	"media_id" integer,
  	"articoli_id" integer
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
  	"utenti_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "utenti_sessions" ADD CONSTRAINT "utenti_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."utenti"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articoli" ADD CONSTRAINT "articoli_copertina_id_media_id_fk" FOREIGN KEY ("copertina_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_articoli_v" ADD CONSTRAINT "_articoli_v_parent_id_articoli_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."articoli"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_articoli_v" ADD CONSTRAINT "_articoli_v_version_copertina_id_media_id_fk" FOREIGN KEY ("version_copertina_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_utenti_fk" FOREIGN KEY ("utenti_id") REFERENCES "public"."utenti"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_articoli_fk" FOREIGN KEY ("articoli_id") REFERENCES "public"."articoli"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_utenti_fk" FOREIGN KEY ("utenti_id") REFERENCES "public"."utenti"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "utenti_sessions_order_idx" ON "utenti_sessions" USING btree ("_order");
  CREATE INDEX "utenti_sessions_parent_id_idx" ON "utenti_sessions" USING btree ("_parent_id");
  CREATE INDEX "utenti_updated_at_idx" ON "utenti" USING btree ("updated_at");
  CREATE INDEX "utenti_created_at_idx" ON "utenti" USING btree ("created_at");
  CREATE UNIQUE INDEX "utenti_email_idx" ON "utenti" USING btree ("email");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "media_sizes_card_sizes_card_filename_idx" ON "media" USING btree ("sizes_card_filename");
  CREATE INDEX "media_sizes_apertura_sizes_apertura_filename_idx" ON "media" USING btree ("sizes_apertura_filename");
  CREATE UNIQUE INDEX "articoli_slug_idx" ON "articoli" USING btree ("slug");
  CREATE INDEX "articoli_copertina_idx" ON "articoli" USING btree ("copertina_id");
  CREATE INDEX "articoli_updated_at_idx" ON "articoli" USING btree ("updated_at");
  CREATE INDEX "articoli_created_at_idx" ON "articoli" USING btree ("created_at");
  CREATE INDEX "articoli__status_idx" ON "articoli" USING btree ("_status");
  CREATE INDEX "_articoli_v_parent_idx" ON "_articoli_v" USING btree ("parent_id");
  CREATE INDEX "_articoli_v_version_version_slug_idx" ON "_articoli_v" USING btree ("version_slug");
  CREATE INDEX "_articoli_v_version_version_copertina_idx" ON "_articoli_v" USING btree ("version_copertina_id");
  CREATE INDEX "_articoli_v_version_version_updated_at_idx" ON "_articoli_v" USING btree ("version_updated_at");
  CREATE INDEX "_articoli_v_version_version_created_at_idx" ON "_articoli_v" USING btree ("version_created_at");
  CREATE INDEX "_articoli_v_version_version__status_idx" ON "_articoli_v" USING btree ("version__status");
  CREATE INDEX "_articoli_v_created_at_idx" ON "_articoli_v" USING btree ("created_at");
  CREATE INDEX "_articoli_v_updated_at_idx" ON "_articoli_v" USING btree ("updated_at");
  CREATE INDEX "_articoli_v_latest_idx" ON "_articoli_v" USING btree ("latest");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_utenti_id_idx" ON "payload_locked_documents_rels" USING btree ("utenti_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_articoli_id_idx" ON "payload_locked_documents_rels" USING btree ("articoli_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_utenti_id_idx" ON "payload_preferences_rels" USING btree ("utenti_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "utenti_sessions" CASCADE;
  DROP TABLE "utenti" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "articoli" CASCADE;
  DROP TABLE "_articoli_v" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TYPE "public"."enum_articoli_categoria";
  DROP TYPE "public"."enum_articoli_status";
  DROP TYPE "public"."enum__articoli_v_version_categoria";
  DROP TYPE "public"."enum__articoli_v_version_status";`)
}
