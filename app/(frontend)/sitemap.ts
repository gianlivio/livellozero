import type { MetadataRoute } from "next";
import { articoliPerSitemap, CATEGORIE } from "@/lib/articoli";
import { inLingua, percorsi } from "@/lib/lingue";
import { baseSito, urlArticolo } from "@/lib/sito";

/**
 * Si rigenera quando si salva un articolo (vedi collections/Articoli.ts);
 * l'ora e' la rete di sicurezza, come per le pagine categoria.
 * Fuori apposta: /cerca, il pannello e ogni indirizzo con ?pagina=.
 */
export const revalidate = 3600;

function url(percorso: string): string {
  return new URL(percorso, baseSito).toString();
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const articoli = await articoliPerSitemap();
  const p = percorsi();

  return [
    { url: url(p.home), changeFrequency: "daily", priority: 1 },
    ...CATEGORIE.map((categoria) => ({
      url: url(`/${inLingua(categoria.percorso, "it")}`),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    { url: url(p.chiSono), changeFrequency: "monthly", priority: 0.5 },
    { url: url(p.progetto), changeFrequency: "monthly", priority: 0.5 },
    ...articoli.map((articolo) => ({
      url: urlArticolo(articolo.slug),
      lastModified: articolo.aggiornato,
      priority: 0.7,
    })),
  ];
}
