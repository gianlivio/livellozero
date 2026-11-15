import { getPayload } from "payload";
import config from "@/payload.config";
import type { Lingua } from "@/lib/lingue";
import type { ChiSono, Media, Progetto } from "@/payload-types";

/** I due richText hanno la stessa forma: un tipo solo per tutti e due. */
export type Testo = ChiSono["testo"];

async function ottieniPayload() {
  const resolvedConfig = await config;
  return getPayload({ config: resolvedConfig });
}

/** Niente ripiego sull'italiano: un testo che manca in quella lingua resta vuoto. */
export async function leggiChiSono(lingua: Lingua): Promise<ChiSono> {
  const payload = await ottieniPayload();
  return payload.findGlobal({
    slug: "chi-sono",
    depth: 2,
    locale: lingua,
    fallbackLocale: false,
  });
}

/**
 * Titolo e descrizione per Google della home, se compilati in quella lingua.
 * Un campo vuoto torna null: la home tiene allora i testi di sempre. La
 * lettura non deve mai rompere la home, che e' solo metadati.
 */
export async function leggiMetadatiHome(
  lingua: Lingua
): Promise<{ titolo: string | null; descrizione: string | null }> {
  try {
    const payload = await ottieniPayload();
    const home = await payload.findGlobal({
      slug: "home",
      depth: 0,
      locale: lingua,
      fallbackLocale: false,
    });
    return {
      titolo: home.titoloGoogle?.trim() || null,
      descrizione: home.descrizioneGoogle?.trim() || null,
    };
  } catch (errore) {
    console.error("[home] metadati non letti", errore);
    return { titolo: null, descrizione: null };
  }
}

export async function leggiProgetto(lingua: Lingua): Promise<Progetto> {
  const payload = await ottieniPayload();
  return payload.findGlobal({
    slug: "progetto",
    depth: 2,
    locale: lingua,
    fallbackLocale: false,
  });
}

/**
 * La foto solo se e' stata caricata davvero. Con depth il campo arriva gia'
 * risolto, ma resta un numero se il media e' stato cancellato dietro.
 */
export function immagineDa(valore: ChiSono["foto"]): Media | null {
  if (!valore || typeof valore !== "object" || !valore.url) return null;
  return valore;
}

type NodoTesto = {
  type?: string;
  text?: string;
  children?: NodoTesto[];
};

function figliDi(valore: unknown): NodoTesto[] {
  const figli = (valore as { children?: unknown } | null | undefined)?.children;
  return Array.isArray(figli) ? (figli as NodoTesto[]) : [];
}

function testoPiano(nodo: NodoTesto): string {
  if (typeof nodo.text === "string") return nodo.text;
  return figliDi(nodo).map(testoPiano).join("");
}

/**
 * Un richText svuotato dal pannello non torna null: resta un paragrafo senza
 * niente dentro. Per sapere se c'e' qualcosa da mostrare va guardato dentro.
 */
export function haTesto(testo: Testo): boolean {
  return figliDi(testo?.root).some((nodo) => testoPiano(nodo).trim() !== "");
}

/** Il primo paragrafo con del testo: in home ne basta uno. */
export function primoParagrafo(testo: Testo): string {
  for (const nodo of figliDi(testo?.root)) {
    if (nodo.type !== "paragraph") continue;
    const piano = testoPiano(nodo).trim();
    if (piano) return piano;
  }
  return "";
}
