import { haArticoli, type Categoria } from "@/lib/articoli";
import { LINGUA_PREDEFINITA, type Lingua } from "@/lib/lingue";
import { haTesto, leggiChiSono, leggiProgetto } from "@/lib/pagine";

/**
 * Quali pagine vanno sui motori di ricerca. Le stesse regole servono ai
 * metadati (noindex), agli hreflang, al selettore di lingua e alla sitemap:
 * stanno qui per non poter andare in disaccordo.
 *
 * In italiano home e sezioni sono sempre indicizzabili: e' il sito
 * principale, e una sezione momentaneamente vuota non va tolta da Google. In
 * un'altra lingua una pagina senza contenuto resta raggiungibile ma fuori.
 * Gli articoli non passano di qui: una pagina articolo esiste solo se
 * l'articolo e' pubblicato in quella lingua, e allora e' indicizzabile.
 */

export const NOINDEX = { robots: { index: false, follow: true } };

export async function homeIndicizzabile(lingua: Lingua): Promise<boolean> {
  return lingua === LINGUA_PREDEFINITA || haArticoli(lingua);
}

export async function sezioneIndicizzabile(
  categoria: Categoria,
  lingua: Lingua
): Promise<boolean> {
  return lingua === LINGUA_PREDEFINITA || haArticoli(lingua, categoria);
}

/** Chi sono e Il progetto: indicizzabili se in quella lingua hanno un testo. */
export async function paginaFissaIndicizzabile(
  pagina: "chiSono" | "progetto",
  lingua: Lingua
): Promise<boolean> {
  const dati =
    pagina === "chiSono"
      ? await leggiChiSono(lingua)
      : await leggiProgetto(lingua);
  return haTesto(dati.testo);
}
