/**
 * Le lingue del sito. L'italiano e' la lingua predefinita e sta senza
 * prefisso; l'inglese sta sotto /en, con indirizzi tradotti.
 */
export type Lingua = "it" | "en";

export const LINGUA_PREDEFINITA: Lingua = "it";

/** Un valore per lingua. L'italiano c'e' sempre; le altre arrivano una alla volta. */
export type PerLingua<T> = { it: T } & Partial<Record<Lingua, T>>;

/**
 * Il valore nella lingua chiesta. Niente ripiego sull'italiano: se manca la
 * versione in quella lingua e' un errore di programma, e deve farsi vedere.
 */
export function inLingua<T>(valori: PerLingua<T>, lingua: Lingua): T {
  const valore = valori[lingua];
  if (valore === undefined) {
    throw new Error(`Manca la versione "${lingua}"`);
  }
  return valore;
}

export const LINGUE: Lingua[] = ["it", "en"];

/** L'altra lingua: il sito ne ha due, quindi c'e' sempre una sola risposta. */
export function altraLingua(lingua: Lingua): Lingua {
  return lingua === "it" ? "en" : "it";
}

/** Il codice di og:locale (Open Graph usa il trattino basso). */
const LOCALE_OG: PerLingua<string> = { it: "it_IT", en: "en_US" };

export function localeOg(lingua: Lingua): string {
  return inLingua(LOCALE_OG, lingua);
}

/** Come si scrivono le date in ciascuna lingua (Intl). */
const FORMATO_DATE: PerLingua<string> = { it: "it-IT", en: "en-US" };

export function formatoDate(lingua: Lingua): string {
  return inLingua(FORMATO_DATE, lingua);
}

/** Gli indirizzi fissi del sito, per lingua. Le sezioni stanno in CATEGORIE. */
const PERCORSI: PerLingua<{
  home: string;
  articoli: string;
  cerca: string;
  chiSono: string;
  progetto: string;
}> = {
  it: {
    home: "/",
    articoli: "/articoli",
    cerca: "/cerca",
    chiSono: "/chi-sono",
    progetto: "/progetto",
  },
  en: {
    home: "/en",
    articoli: "/en/articles",
    cerca: "/en/search",
    chiSono: "/en/about",
    progetto: "/en/project",
  },
};

export function percorsi(lingua: Lingua = LINGUA_PREDEFINITA) {
  return inLingua(PERCORSI, lingua);
}

export function percorsoArticolo(
  slug: string,
  lingua: Lingua = LINGUA_PREDEFINITA
): string {
  return `${percorsi(lingua).articoli}/${slug}`;
}
