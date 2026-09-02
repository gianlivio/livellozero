import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { vercelBlobStorage } from "@payloadcms/storage-vercel-blob";
import { it } from "@payloadcms/translations/languages/it";
import path from "path";
import { buildConfig } from "payload";
import { fileURLToPath } from "url";
import sharp from "sharp";

import { Utenti } from "./collections/Utenti";
import { Media } from "./collections/Media";
import { Articoli } from "./collections/Articoli";
import { migrations } from "./migrations";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  admin: {
    user: Utenti.slug,
    meta: {
      titleSuffix: " — Livello Zero",
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Utenti, Media, Articoli],
  editor: lexicalEditor(),
  i18n: {
    supportedLanguages: { it },
    fallbackLanguage: "it",
  },
  secret: process.env.PAYLOAD_SECRET || "",
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || "",
    },
    migrationDir: path.resolve(dirname, "migrations"),
    prodMigrations: migrations,
  }),
  sharp,
  plugins: [
    vercelBlobStorage({
      enabled: true,
      collections: { media: true },
      token: process.env.BLOB_READ_WRITE_TOKEN,
      clientUploads: false,
    }),
  ],
});
