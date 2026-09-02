import { getPayload } from "payload";
import config from "@/payload.config";
import type { Articoli as ArticoloDoc, Media as MediaDoc } from "@/payload-types";

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

export type Articolo = {
  slug: string;
  titolo: string;
  sommario: string;
  categoria: Categoria;
  data: string;
  minuti: number;
  corpo: ArticoloDoc["corpo"];
  copertina: Immagine | null;
};

export const CATEGORIE: {
  chiave: Categoria;
  nome: string;
  descrizione: string;
}[] = [
  {
    chiave: "approfondimenti",
    nome: "Approfondimenti",
    descrizione:
      "Come nascono i giochi: l'idea iniziale, lo sviluppo, le cose cambiate lungo la strada.",
  },
  {
    chiave: "recensioni",
    nome: "Recensioni",
    descrizione: "Giudizi personali, senza voti numerici.",
  },
  {
    chiave: "consigli",
    nome: "Consigli",
    descrizione:
      "Cosa giocare dopo un certo titolo, o se cerchi una certa atmosfera.",
  },
  {
    chiave: "riflessioni",
    nome: "Riflessioni",
    descrizione:
      "Ragionamenti su come stanno cambiando i videogiochi e chi li fa.",
  },
  {
    chiave: "classifiche",
    nome: "Classifiche",
    descrizione: "Liste ragionate su una saga, un autore, un genere.",
  },
];

async function ottieniPayload() {
  const resolvedConfig = await config;
  return getPayload({ config: resolvedConfig });
}

function mappaImmagine(copertina: ArticoloDoc["copertina"]): Immagine | null {
  if (!copertina || typeof copertina !== "object") return null;
  const media = copertina as MediaDoc;
  if (!media.url) return null;
  return {
    url: media.url,
    alt: media.alt ?? "",
    larghezza: media.width,
    altezza: media.height,
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
  };
}

export async function tuttiGliArticoli(): Promise<Articolo[]> {
  const payload = await ottieniPayload();
  const risultato = await payload.find({
    collection: "articoli",
    where: {
      _status: { equals: "published" },
    },
    sort: "-dataPubblicazione",
    depth: 2,
    limit: 0,
  });
  return risultato.docs.map(mappaArticolo);
}

export async function articoliPerCategoria(
  categoria: Categoria
): Promise<Articolo[]> {
  const payload = await ottieniPayload();
  const risultato = await payload.find({
    collection: "articoli",
    where: {
      and: [
        { _status: { equals: "published" } },
        { categoria: { equals: categoria } },
      ],
    },
    sort: "-dataPubblicazione",
    depth: 2,
    limit: 0,
  });
  return risultato.docs.map(mappaArticolo);
}

export async function articoloPerSlug(
  slug: string
): Promise<Articolo | undefined> {
  const payload = await ottieniPayload();
  const risultato = await payload.find({
    collection: "articoli",
    where: {
      and: [{ _status: { equals: "published" } }, { slug: { equals: slug } }],
    },
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
