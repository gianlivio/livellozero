import type { MetadataRoute } from "next";
import { articoliPerSitemap, CATEGORIE, percorsoCategoria } from "@/lib/articoli";
import {
  homeIndicizzabile,
  paginaFissaIndicizzabile,
  sezioneIndicizzabile,
} from "@/lib/indicizzabili";
import { LINGUE, percorsi, percorsoArticolo, type Lingua } from "@/lib/lingue";
import { urlAssoluto } from "@/lib/sito";

/**
 * Si rigenera quando si salva un articolo (vedi collections/Articoli.ts);
 * l'ora e' la rete di sicurezza, come per le pagine categoria.
 * Fuori apposta: la ricerca, il pannello, ogni indirizzo con ?pagina= e le
 * pagine in noindex (le regole stanno in lib/indicizzabili.ts).
 */
export const revalidate = 3600;

type Voce = MetadataRoute.Sitemap[number];
type PerLingua = Partial<Record<Lingua, string | null>>;

/**
 * Una pagina nelle lingue in cui e' indicizzabile. Se lo e' in tutte e due,
 * ogni voce dichiara anche la gemella, come fanno gli hreflang nella pagina.
 */
function voci(percorsiPerLingua: PerLingua, extra: Omit<Voce, "url">): Voce[] {
  const presenti = LINGUE.filter((l) => percorsiPerLingua[l]);
  const gemelle =
    presenti.length === LINGUE.length
      ? {
          alternates: {
            languages: {
              it: urlAssoluto(percorsiPerLingua.it!),
              en: urlAssoluto(percorsiPerLingua.en!),
              "x-default": urlAssoluto(percorsiPerLingua.it!),
            },
          },
        }
      : {};
  return presenti.map((l) => ({
    url: urlAssoluto(percorsiPerLingua[l]!),
    ...extra,
    ...gemelle,
  }));
}

/** Il percorso se la pagina e' indicizzabile in quella lingua, se no null. */
async function se(indicizzabile: Promise<boolean>, percorso: string) {
  return (await indicizzabile) ? percorso : null;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [articoliIt, articoliEn] = await Promise.all([
    articoliPerSitemap("it"),
    articoliPerSitemap("en"),
  ]);
  const slugEn = new Map(articoliEn.map((a) => [a.id, a.slug]));

  const home = voci(
    {
      it: await se(homeIndicizzabile("it"), percorsi("it").home),
      en: await se(homeIndicizzabile("en"), percorsi("en").home),
    },
    { changeFrequency: "daily", priority: 1 }
  );

  const sezioni = (
    await Promise.all(
      CATEGORIE.map(async ({ chiave }) =>
        voci(
          {
            it: await se(
              sezioneIndicizzabile(chiave, "it"),
              percorsoCategoria(chiave, "it")
            ),
            en: await se(
              sezioneIndicizzabile(chiave, "en"),
              percorsoCategoria(chiave, "en")
            ),
          },
          { changeFrequency: "weekly", priority: 0.8 }
        )
      )
    )
  ).flat();

  const fisse = (
    await Promise.all(
      (["chiSono", "progetto"] as const).map(async (pagina) =>
        voci(
          {
            it: await se(
              paginaFissaIndicizzabile(pagina, "it"),
              percorsi("it")[pagina]
            ),
            en: await se(
              paginaFissaIndicizzabile(pagina, "en"),
              percorsi("en")[pagina]
            ),
          },
          { changeFrequency: "monthly", priority: 0.5 }
        )
      )
    )
  ).flat();

  // Gli articoli italiani, ciascuno con la sua versione inglese se c'e'. Un
  // articolo solo inglese non puo' esistere: l'italiano e' la lingua di base.
  const articoli = articoliIt.flatMap((articolo) => {
    const inglese = slugEn.get(articolo.id);
    return voci(
      {
        it: percorsoArticolo(articolo.slug, "it"),
        en: inglese ? percorsoArticolo(inglese, "en") : null,
      },
      { lastModified: articolo.aggiornato, priority: 0.7 }
    );
  });

  return [...home, ...sezioni, ...fisse, ...articoli];
}
