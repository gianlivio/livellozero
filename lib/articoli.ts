import { draftMode } from "next/headers";
import { getPayload, type Where } from "payload";
import config from "@/payload.config";
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
  categoria: Categoria;
  data: string;
  minuti: number;
  corpo: ArticoloDoc["corpo"];
  copertina: Immagine | null;
  autore: Autore | null;
};

/**
 * Chiave e nome restano qui: la chiave e' l'indirizzo della pagina, e un nome
 * cambiato dal pannello non deve poter rompere il menu. Le descrizioni invece
 * stanno nel global "categorie": vedi descrizioneCategoria.
 */
export const CATEGORIE: { chiave: Categoria; nome: string }[] = [
  { chiave: "approfondimenti", nome: "Approfondimenti" },
  { chiave: "recensioni", nome: "Recensioni" },
  { chiave: "consigli", nome: "Notizie" },
  { chiave: "riflessioni", nome: "Riflessioni" },
  { chiave: "classifiche", nome: "Classifiche" },
];

async function ottieniPayload() {
  const resolvedConfig = await config;
  return getPayload({ config: resolvedConfig });
}

/** La descrizione scritta nel pannello, o stringa vuota se non c'e'. */
export async function descrizioneCategoria(
  categoria: Categoria
): Promise<string> {
  const payload = await ottieniPayload();
  const globale = await payload.findGlobal({ slug: "categorie", depth: 0 });
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
    categoria: doc.categoria,
    data: doc.dataPubblicazione.slice(0, 10),
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
async function trovaElenco(where: Where, pagina: number): Promise<Elenco> {
  const payload = await ottieniPayload();
  const query = {
    collection: "articoli" as const,
    where,
    sort: "-dataPubblicazione",
    depth: 2,
    limit: PER_PAGINA,
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
export async function tuttiGliArticoli(): Promise<Articolo[]> {
  const payload = await ottieniPayload();
  const risultato = await payload.find({
    collection: "articoli",
    where: PUBBLICATI,
    sort: "-dataPubblicazione",
    depth: 2,
    limit: 0,
  });
  return risultato.docs.map(mappaArticolo);
}

/** Per la sitemap bastano indirizzo e data dell'ultima modifica. */
export async function articoliPerSitemap(): Promise<
  { slug: string; aggiornato: string }[]
> {
  const payload = await ottieniPayload();
  const risultato = await payload.find({
    collection: "articoli",
    where: PUBBLICATI,
    sort: "-dataPubblicazione",
    select: { slug: true, updatedAt: true },
    depth: 0,
    limit: 0,
  });
  return risultato.docs.map((doc) => ({
    slug: doc.slug,
    aggiornato: doc.updatedAt,
  }));
}

export async function elencoArticoli(pagina = 1): Promise<Elenco> {
  return trovaElenco(PUBBLICATI, pagina);
}

export async function articoliPerCategoria(
  categoria: Categoria,
  pagina = 1
): Promise<Elenco> {
  return trovaElenco(
    { and: [PUBBLICATI, { categoria: { equals: categoria } }] },
    pagina
  );
}

/**
 * Cerca su titolo e sommario. L'operatore like di Payload diventa un ILIKE per
 * ogni parola del termine: le maiuscole non contano, e le parole vanno trovate
 * tutte nello stesso campo.
 */
export async function cercaArticoli(q: string, pagina = 1): Promise<Elenco> {
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
    pagina
  );
}

/**
 * Cosa proporre in fondo a una lettura: prima gli articoli della stessa
 * categoria, dal piu' recente; se non bastano si completa con gli altri.
 * L'articolo che si sta leggendo resta sempre fuori.
 */
export async function articoliCorrelati(
  articolo: Articolo,
  quanti = 2
): Promise<Articolo[]> {
  const payload = await ottieniPayload();
  const query = {
    collection: "articoli" as const,
    sort: "-dataPubblicazione",
    depth: 2,
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
  slug: string
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
  });
  const doc = risultato.docs[0];
  return doc ? mappaArticolo(doc) : undefined;
}

export function nomeCategoria(categoria: Categoria): string {
  return CATEGORIE.find((c) => c.chiave === categoria)?.nome ?? categoria;
}

export function dataLeggibile(iso: string): string {
  return new Intl.DateTimeFormat("it-IT", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${iso}T00:00:00`));
}
