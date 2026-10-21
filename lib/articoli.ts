import { draftMode } from "next/headers";
import { getPayload, type Where } from "payload";
import config from "@/payload.config";
import {
  formatoDate,
  inLingua,
  LINGUA_PREDEFINITA,
  type Lingua,
  type PerLingua,
} from "@/lib/lingue";
import type {
  Articoli as ArticoloDoc,
  Autori as AutoreDoc,
  Media as MediaDoc,
} from "@/payload-types";

export type Categoria =
  | "approfondimenti"
  | "recensioni"
  | "consigli"
  | "riflessioni"
  | "classifiche";

export type Immagine = {
  url: string;
  alt: string;
  larghezza?: number | null;
  altezza?: number | null;
};

export type Autore = {
  nome: string;
  bio: string | null;
  foto: Immagine | null;
  instagram: string | null;
  email: string | null;
};

export type Articolo = {
  slug: string;
  titolo: string;
  sommario: string;
  titoloGoogle: string | null;
  descrizioneGoogle: string | null;
  categoria: Categoria;
  data: string;
  dataISO: string;
  minuti: number;
  corpo: ArticoloDoc["corpo"];
  copertina: Immagine | null;
  autore: Autore | null;
};

/**
 * Chiave, nome e indirizzo restano qui: un nome o un indirizzo cambiato dal
 * pannello non deve poter rompere il menu. La chiave e' il valore salvato
 * negli articoli e non cambia con la lingua; nome e percorso si'. Le
 * descrizioni invece stanno nel global "categorie": vedi descrizioneCategoria.
 */
export const CATEGORIE: {
  chiave: Categoria;
  nome: PerLingua<string>;
  percorso: PerLingua<string>;
}[] = [
  {
    chiave: "approfondimenti",
    nome: { it: "Approfondimenti" },
    percorso: { it: "approfondimenti" },
  },
  {
    chiave: "recensioni",
    nome: { it: "Recensioni" },
    percorso: { it: "recensioni" },
  },
  {
    chiave: "consigli",
    nome: { it: "Notizie" },
    percorso: { it: "consigli" },
  },
  {
    chiave: "riflessioni",
    nome: { it: "Riflessioni" },
    percorso: { it: "riflessioni" },
  },
  {
    chiave: "classifiche",
    nome: { it: "Classifiche" },
    percorso: { it: "classifiche" },
  },
];

/** La sezione che risponde a un indirizzo, in quella lingua. */
export function categoriaDaPercorso(
  percorso: string,
  lingua: Lingua = LINGUA_PREDEFINITA
) {
  return CATEGORIE.find((c) => c.percorso[lingua] === percorso);
}

export function percorsoCategoria(
  categoria: Categoria,
  lingua: Lingua = LINGUA_PREDEFINITA
): string {
  const info = CATEGORIE.find((c) => c.chiave === categoria);
  return info ? `/${inLingua(info.percorso, lingua)}` : `/${categoria}`;
}

async function ottieniPayload() {
  const resolvedConfig = await config;
  return getPayload({ config: resolvedConfig });
}

/**
 * Le opzioni di lingua da aggiungere a ogni lettura da Payload. Per ora
 * nessuna: la localizzazione non e' ancora attiva in payload.config.ts.
 * Quando lo sara', qui arriveranno locale e fallbackLocale: false, e tutte le
 * query di questo file le prenderanno da un punto solo.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function opzioniLingua(lingua: Lingua) {
  return {};
}

/** La descrizione scritta nel pannello, o stringa vuota se non c'e'. */
export async function descrizioneCategoria(
  categoria: Categoria,
  lingua: Lingua = LINGUA_PREDEFINITA
): Promise<string> {
  const payload = await ottieniPayload();
  const globale = await payload.findGlobal({
    slug: "categorie",
    depth: 0,
    ...opzioniLingua(lingua),
  });
  const voce = globale.voci?.find((v) => v.chiave === categoria);
  return voce?.descrizione?.trim() ?? "";
}

function mappaImmagine(
  copertina: number | MediaDoc | null | undefined
): Immagine | null {
  if (!copertina || typeof copertina !== "object") return null;
  const media = copertina as MediaDoc;
  if (!media.url) return null;
  // Sempre l'originale, mai i ritagli di collections/Media.ts: quelli sono
  // piu' piccoli dei riquadri in cui finiscono su uno schermo a doppia densita'.
  return {
    url: media.url,
    alt: media.alt ?? "",
    larghezza: media.width,
    altezza: media.height,
  };
}

function mappaAutore(autore: ArticoloDoc["autore"]): Autore | null {
  if (!autore || typeof autore !== "object") return null;
  const doc = autore as AutoreDoc;
  return {
    nome: doc.nome,
    bio: doc.bio ?? null,
    foto: mappaImmagine(doc.foto),
    instagram: doc.instagram ?? null,
    email: doc.email ?? null,
  };
}

function mappaArticolo(doc: ArticoloDoc): Articolo {
  return {
    slug: doc.slug,
    titolo: doc.titolo,
    sommario: doc.sommario,
    titoloGoogle: doc.titoloGoogle ?? null,
    descrizioneGoogle: doc.descrizioneGoogle ?? null,
    categoria: doc.categoria,
    data: doc.dataPubblicazione.slice(0, 10),
    dataISO: doc.dataPubblicazione,
    minuti: doc.minuti ?? 0,
    corpo: doc.corpo,
    copertina: mappaImmagine(doc.copertina),
    autore: mappaAutore(doc.autore),
  };
}

/** Quanti articoli entrano in una pagina di elenco: home, categoria, ricerca. */
export const PER_PAGINA = 10;

export type Elenco = {
  articoli: Articolo[];
  /** La pagina davvero mostrata, che non sempre e' quella chiesta: vedi trovaElenco. */
  pagina: number;
  pagineTotali: number;
  haPrecedente: boolean;
  haSuccessiva: boolean;
};

const PUBBLICATI: Where = { _status: { equals: "published" } };

const ELENCO_VUOTO: Elenco = {
  articoli: [],
  pagina: 1,
  pagineTotali: 0,
  haPrecedente: false,
  haSuccessiva: false,
};

/**
 * Una pagina di elenco. Chiedere una pagina che non esiste — un link vecchio,
 * un indirizzo scritto a mano — non deve dare una lista vuota: si ricade
 * sull'ultima pagina piena, e chi impagina usa la pagina che torna di qui.
 */
async function trovaElenco(
  where: Where,
  pagina: number,
  lingua: Lingua
): Promise<Elenco> {
  const payload = await ottieniPayload();
  const query = {
    collection: "articoli" as const,
    where,
    sort: "-dataPubblicazione",
    depth: 2,
    limit: PER_PAGINA,
    ...opzioniLingua(lingua),
  };

  let risultato = await payload.find({ ...query, page: pagina });
  if (risultato.totalPages > 0 && pagina > risultato.totalPages) {
    risultato = await payload.find({ ...query, page: risultato.totalPages });
  }

  return {
    articoli: risultato.docs.map(mappaArticolo),
    pagina: risultato.page ?? 1,
    pagineTotali: risultato.totalPages,
    haPrecedente: risultato.hasPrevPage,
    haSuccessiva: risultato.hasNextPage,
  };
}

/** Il numero di pagina che arriva da ?pagina=. Tutto il resto vale 1. */
export function paginaRichiesta(valore: string | string[] | undefined): number {
  const grezzo = Array.isArray(valore) ? valore[0] : valore;
  const numero = Number.parseInt(grezzo ?? "", 10);
  return Number.isFinite(numero) && numero > 1 ? numero : 1;
}

/** Tutti gli articoli in una volta: serve a generateStaticParams, non agli elenchi. */
export async function tuttiGliArticoli(
  lingua: Lingua = LINGUA_PREDEFINITA
): Promise<Articolo[]> {
  const payload = await ottieniPayload();
  const risultato = await payload.find({
    collection: "articoli",
    where: PUBBLICATI,
    sort: "-dataPubblicazione",
    depth: 2,
    limit: 0,
    ...opzioniLingua(lingua),
  });
  return risultato.docs.map(mappaArticolo);
}

/** Per la sitemap bastano indirizzo e data dell'ultima modifica. */
export async function articoliPerSitemap(
  lingua: Lingua = LINGUA_PREDEFINITA
): Promise<{ slug: string; aggiornato: string }[]> {
  const payload = await ottieniPayload();
  const risultato = await payload.find({
    collection: "articoli",
    where: PUBBLICATI,
    sort: "-dataPubblicazione",
    select: { slug: true, updatedAt: true },
    depth: 0,
    limit: 0,
    ...opzioniLingua(lingua),
  });
  return risultato.docs.map((doc) => ({
    slug: doc.slug,
    aggiornato: doc.updatedAt,
  }));
}

export async function elencoArticoli(
  pagina = 1,
  lingua: Lingua = LINGUA_PREDEFINITA
): Promise<Elenco> {
  return trovaElenco(PUBBLICATI, pagina, lingua);
}

export async function articoliPerCategoria(
  categoria: Categoria,
  pagina = 1,
  lingua: Lingua = LINGUA_PREDEFINITA
): Promise<Elenco> {
  return trovaElenco(
    { and: [PUBBLICATI, { categoria: { equals: categoria } }] },
    pagina,
    lingua
  );
}

/**
 * Cerca su titolo e sommario. L'operatore like di Payload diventa un ILIKE per
 * ogni parola del termine: le maiuscole non contano, e le parole vanno trovate
 * tutte nello stesso campo.
 */
export async function cercaArticoli(
  q: string,
  pagina = 1,
  lingua: Lingua = LINGUA_PREDEFINITA
): Promise<Elenco> {
  const termine = q.trim();
  if (!termine) return ELENCO_VUOTO;

  return trovaElenco(
    {
      and: [
        PUBBLICATI,
        {
          or: [{ titolo: { like: termine } }, { sommario: { like: termine } }],
        },
      ],
    },
    pagina,
    lingua
  );
}

/**
 * Cosa proporre in fondo a una lettura: prima gli articoli della stessa
 * categoria, dal piu' recente; se non bastano si completa con gli altri.
 * L'articolo che si sta leggendo resta sempre fuori.
 */
export async function articoliCorrelati(
  articolo: Articolo,
  quanti = 2,
  lingua: Lingua = LINGUA_PREDEFINITA
): Promise<Articolo[]> {
  const payload = await ottieniPayload();
  const query = {
    collection: "articoli" as const,
    sort: "-dataPubblicazione",
    depth: 2,
    ...opzioniLingua(lingua),
  };

  const stessaCategoria = await payload.find({
    ...query,
    where: {
      and: [
        PUBBLICATI,
        { categoria: { equals: articolo.categoria } },
        { slug: { not_equals: articolo.slug } },
      ],
    },
    limit: quanti,
  });
  const correlati = stessaCategoria.docs.map(mappaArticolo);
  if (correlati.length >= quanti) return correlati;

  // Gli altri sono per forza di un'altra categoria, quindi non e' l'articolo
  // corrente: non serve riescluderlo.
  const altri = await payload.find({
    ...query,
    where: {
      and: [PUBBLICATI, { categoria: { not_equals: articolo.categoria } }],
    },
    limit: quanti - correlati.length,
  });

  return [...correlati, ...altri.docs.map(mappaArticolo)];
}

export async function articoloPerSlug(
  slug: string,
  lingua: Lingua = LINGUA_PREDEFINITA
): Promise<Articolo | undefined> {
  const payload = await ottieniPayload();
  const { isEnabled: anteprima } = await draftMode();

  const risultato = await payload.find({
    collection: "articoli",
    where: anteprima
      ? { slug: { equals: slug } }
      : {
          and: [
            { _status: { equals: "published" } },
            { slug: { equals: slug } },
          ],
        },
    draft: anteprima,
    depth: 2,
    limit: 1,
    ...opzioniLingua(lingua),
  });
  const doc = risultato.docs[0];
  return doc ? mappaArticolo(doc) : undefined;
}

export function nomeCategoria(
  categoria: Categoria,
  lingua: Lingua = LINGUA_PREDEFINITA
): string {
  const info = CATEGORIE.find((c) => c.chiave === categoria);
  return info ? inLingua(info.nome, lingua) : categoria;
}

export function dataLeggibile(
  iso: string,
  lingua: Lingua = LINGUA_PREDEFINITA
): string {
  return new Intl.DateTimeFormat(formatoDate(lingua), {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${iso}T00:00:00`));
}
