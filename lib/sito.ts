import type { Metadata } from "next";
import { LINGUA_PREDEFINITA, percorsoArticolo, type Lingua } from "./lingue";

/**
 * Base pubblica del sito: una sola fonte per i metadati (metadataBase) e per
 * gli url assoluti che servono altrove, come quelli dei link di condivisione.
 */
export const baseSito = new URL(
  process.env.NEXT_PUBLIC_SITE_URL || "https://livellozero.vercel.app"
);

export function urlArticolo(
  slug: string,
  lingua: Lingua = LINGUA_PREDEFINITA
): string {
  return new URL(percorsoArticolo(slug, lingua), baseSito).toString();
}

export function urlAssoluto(percorso: string): string {
  return new URL(percorso, baseSito).toString();
}

/**
 * Gli hreflang di una pagina: solo se esiste la gemella e sono indicizzabili
 * tutte e due, altrimenti niente. x-default e' l'italiano, la lingua del sito.
 * I percorsi null sono le lingue in cui la pagina non c'e' o e' in noindex.
 */
export function alternati(
  percorsi: Partial<Record<Lingua, string | null>>
): Metadata["alternates"] {
  const { it, en } = percorsi;
  if (!it || !en) return undefined;
  return {
    languages: {
      it: urlAssoluto(it),
      en: urlAssoluto(en),
      "x-default": urlAssoluto(it),
    },
  };
}
