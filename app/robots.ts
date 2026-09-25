import type { MetadataRoute } from "next";
import { baseSito } from "@/lib/sito";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api", "/cerca"],
    },
    sitemap: new URL("/sitemap.xml", baseSito).toString(),
  };
}
