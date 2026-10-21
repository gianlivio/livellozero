import type { MetadataRoute } from "next";
import { baseSito } from "@/lib/sito";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api", "/cerca", "/en/search"],
    },
    sitemap: new URL("/sitemap.xml", baseSito).toString(),
  };
}
