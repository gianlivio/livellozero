import type { Articolo } from "./articoli";

export type VoceIndice = {
  /** Ancora della sezione: l'id messo sull'h2 dal converter del richtext. */
  id: string;
  testo: string;
};

type NodoCorpo = {
  type?: string;
  tag?: string;
  text?: string;
  children?: NodoCorpo[];
};

function figliDi(valore: unknown): NodoCorpo[] {
  const figli = (valore as { children?: unknown } | null | undefined)?.children;
  return Array.isArray(figli) ? (figli as NodoCorpo[]) : [];
}

/** Testo piano di un nodo: concatena i nodi di testo a qualsiasi profondita'. */
function testoPiano(nodo: NodoCorpo): string {
  if (typeof nodo.text === "string") return nodo.text;
  return figliDi(nodo).map(testoPiano).join("");
}

function ancora(testo: string): string {
  const slug = testo
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "sezione";
}

/**
 * I titoli di sezione (h2 di primo livello) nell'ordine in cui compaiono.
 * `posizione` e' l'indice del nodo fra i figli della radice: e' la chiave che
 * lega questo elenco agli id che il converter mette sugli h2, cosi' indice e
 * ancore restano d'accordo anche con due titoli dal testo identico.
 */
function vociConPosizione(
  radice: unknown
): (VoceIndice & { posizione: number })[] {
  const usate = new Map<string, number>();
  const voci: (VoceIndice & { posizione: number })[] = [];

  figliDi(radice).forEach((nodo, posizione) => {
    if (nodo.type !== "heading" || nodo.tag !== "h2") return;
    const testo = testoPiano(nodo).trim();
    if (!testo) return;

    const slug = ancora(testo);
    const volta = (usate.get(slug) ?? 0) + 1;
    usate.set(slug, volta);
    voci.push({
      id: volta === 1 ? slug : `${slug}-${volta}`,
      testo,
      posizione,
    });
  });

  return voci;
}

export function titoliArticolo(corpo: Articolo["corpo"]): VoceIndice[] {
  return vociConPosizione(corpo?.root).map(({ id, testo }) => ({ id, testo }));
}

/** L'ancora dell'h2 che sta in `posizione` fra i figli della radice. */
export function ancoraTitolo(
  radice: unknown,
  posizione: number
): string | undefined {
  return vociConPosizione(radice).find((voce) => voce.posizione === posizione)
    ?.id;
}
