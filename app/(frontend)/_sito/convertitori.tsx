import {
  LinkJSXConverter,
  type JSXConverters,
  type JSXConvertersFunction,
} from "@payloadcms/richtext-lexical/react";
import { percorsoArticolo, type Lingua } from "@/lib/lingue";

type NodoLink = { fields: { linkType?: string; doc?: unknown } };

/**
 * L'indirizzo di un collegamento interno, nella lingua della pagina che lo
 * mostra, o null se non c'e' un posto dove portare il lettore. L'editor
 * propone solo gli articoli (vedi editor.ts); il documento collegato arriva
 * gia' popolato, con lo slug nella lingua della lettura e i soli campi di
 * defaultPopulate (collections/Articoli.ts).
 *
 * Niente indirizzo se il documento non e' un oggetto (cancellato dietro),
 * non e' pubblicato, non ha slug in questa lingua o, in inglese, ha la
 * casella "Mostra la versione inglese" spenta: la pagina non esisterebbe.
 */
function indirizzoInterno(nodo: NodoLink, lingua: Lingua): string | null {
  const doc = nodo.fields.doc as
    | { relationTo?: string; value?: unknown }
    | undefined;
  const articolo = doc?.value;
  if (doc?.relationTo !== "articoli") return null;
  if (typeof articolo !== "object" || articolo === null) return null;

  const { slug, _status, ingleseVisibile } = articolo as {
    slug?: string | null;
    _status?: string | null;
    ingleseVisibile?: boolean | null;
  };
  if (_status !== "published" || !slug) return null;
  if (lingua === "en" && ingleseVisibile !== true) return null;
  return percorsoArticolo(slug, lingua);
}

/**
 * I convertitori di tutti i testi del sito: quelli di serie, con i
 * collegamenti interni risolti per la lingua. Un collegamento senza
 * destinazione resta il solo testo, in un <span>. `extra` aggiunge o
 * sostituisce convertitori (la pagina dell'articolo ha i suoi per titoli e
 * immagini).
 */
export function convertitoriTesto(
  lingua: Lingua,
  extra: JSXConverters = {}
): JSXConvertersFunction {
  const collegamenti = LinkJSXConverter({
    internalDocToHref: ({ linkNode }) =>
      indirizzoInterno(linkNode, lingua) ?? "",
  });

  return ({ defaultConverters }) => ({
    ...defaultConverters,
    ...collegamenti,
    link: (argomenti) => {
      const { node, nodesToJSX } = argomenti;
      if (
        node.fields.linkType === "internal" &&
        indirizzoInterno(node, lingua) === null
      ) {
        return <span>{nodesToJSX({ nodes: node.children })}</span>;
      }
      return (collegamenti.link as (a: typeof argomenti) => React.ReactNode)(
        argomenti
      );
    },
    ...extra,
  });
}
