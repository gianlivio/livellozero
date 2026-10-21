import {
  inLingua,
  LINGUA_PREDEFINITA,
  type Lingua,
  type PerLingua,
} from "./lingue";

/**
 * Le cinque sezioni. Stanno in un file senza dipendenze perche' servono anche
 * agli hook di Payload (collections/, globals/), che non possono importare
 * lib/articoli.ts: si tirerebbe dietro payload.config.ts, che importa loro.
 * proxy.ts invece ha i percorsi scritti a mano, apposta: vedi il suo commento.
 */
export type Categoria =
  | "approfondimenti"
  | "recensioni"
  | "consigli"
  | "riflessioni"
  | "classifiche";

/**
 * Chiave, nome e indirizzo restano qui: un nome o un indirizzo cambiato dal
 * pannello non deve poter rompere il menu. La chiave e' il valore salvato
 * negli articoli e non cambia con la lingua; nome e percorso si'. Le
 * descrizioni invece stanno nel global "categorie".
 */
export const CATEGORIE: {
  chiave: Categoria;
  nome: PerLingua<string>;
  percorso: PerLingua<string>;
}[] = [
  {
    chiave: "approfondimenti",
    nome: { it: "Approfondimenti", en: "Deep dives" },
    percorso: { it: "approfondimenti", en: "deep-dives" },
  },
  {
    chiave: "recensioni",
    nome: { it: "Recensioni", en: "Reviews" },
    percorso: { it: "recensioni", en: "reviews" },
  },
  {
    chiave: "consigli",
    nome: { it: "Notizie", en: "News" },
    percorso: { it: "consigli", en: "news" },
  },
  {
    chiave: "riflessioni",
    nome: { it: "Riflessioni", en: "Opinions" },
    percorso: { it: "riflessioni", en: "opinions" },
  },
  {
    chiave: "classifiche",
    nome: { it: "Classifiche", en: "Rankings" },
    percorso: { it: "classifiche", en: "rankings" },
  },
];

/** La sezione che risponde a un indirizzo, in quella lingua. */
export function categoriaDaPercorso(
  percorso: string,
  lingua: Lingua = LINGUA_PREDEFINITA
) {
  return CATEGORIE.find((c) => c.percorso[lingua] === percorso);
}

/** L'indirizzo completo di una sezione: /recensioni, /en/reviews. */
export function percorsoCategoria(
  categoria: Categoria,
  lingua: Lingua = LINGUA_PREDEFINITA
): string {
  const info = CATEGORIE.find((c) => c.chiave === categoria);
  const ultimo = info ? inLingua(info.percorso, lingua) : categoria;
  return lingua === "it" ? `/${ultimo}` : `/${lingua}/${ultimo}`;
}
