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
import { Autori } from "./collections/Autori";
import { migrations } from "./migrations";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const indirizzoSito =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

export default buildConfig({
  admin: {
    user: Utenti.slug,
    meta: {
      titleSuffix: " — Livello Zero",
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
    livePreview: {
      collections: ["articoli"],
      breakpoints: [
        { name: "desktop", label: "Computer", width: 1440, height: 900 },
        { name: "tablet", label: "Tablet", width: 768, height: 1024 },
        { name: "mobile", label: "Telefono", width: 390, height: 844 },
      ],
      url: ({ data }) => {
        const parametri = new URLSearchParams({
          slug: String(data?.slug ?? ""),
          collection: "articoli",
          path: `/articoli/${data?.slug ?? ""}`,
          previewSecret: process.env.PREVIEW_SECRET || "",
        });
        return `${indirizzoSito}/next/preview?${parametri.toString()}`;
      },
    },
  },
  collections: [Utenti, Media, Autori, Articoli],
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
    push: false,
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
      addRandomSuffix: true,
    }),
  ],
});
