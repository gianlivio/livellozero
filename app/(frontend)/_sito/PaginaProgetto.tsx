import type { Metadata } from "next";
import { RichText } from "@payloadcms/richtext-lexical/react";
import { convertitoriTesto } from "./convertitori";
import { NOINDEX, paginaFissaIndicizzabile } from "@/lib/indicizzabili";
import { percorsi, type Lingua } from "@/lib/lingue";
import { haTesto, leggiProgetto } from "@/lib/pagine";
import { alternati } from "@/lib/sito";
import { testi } from "@/lib/testi";

/** Noindex e hreflang: le regole stanno in lib/indicizzabili.ts. */
export async function metadatiProgetto(lingua: Lingua): Promise<Metadata> {
  const t = testi(lingua);
  const [it, en] = await Promise.all([
    paginaFissaIndicizzabile("progetto", "it"),
    paginaFissaIndicizzabile("progetto", "en"),
  ]);
  const qui = lingua === "it" ? it : en;
  return {
    title: t.titoloPagina(t.progettoTitolo),
    description: t.progettoDescrizione,
    ...(!qui && NOINDEX),
    alternates: alternati({
      it: it ? percorsi("it").progetto : null,
      en: en ? percorsi("en").progetto : null,
    }),
  };
}

export default async function PaginaProgetto({ lingua }: { lingua: Lingua }) {
  const t = testi(lingua);
  const pagina = await leggiProgetto(lingua);

  return (
    <section className="guscio pagina-progetto">
      {/* Il titolo del pannello solo con il testo nella stessa lingua: senza,
          arriva il valore predefinito del campo, che e' in italiano. */}
      <h1>{haTesto(pagina.testo) ? pagina.titolo : t.progettoTitolo}</h1>
      {!haTesto(pagina.testo) && <p>{t.paginaVuota}</p>}
      {haTesto(pagina.testo) && (
        <RichText
          className="progetto-corpo"
          data={pagina.testo!}
          converters={convertitoriTesto(lingua)}
        />
      )}
      {(pagina.donazioniTesto || pagina.donazioniLink) && (
        <div className="progetto-sostegno">
          <h2>{t.sostieni}</h2>
          {pagina.donazioniTesto && <p>{pagina.donazioniTesto}</p>}
          {pagina.donazioniLink && (
            <a href={pagina.donazioniLink} className="pulsante-accento">
              {t.offrimiCaffe}
            </a>
          )}
        </div>
      )}
    </section>
  );
}
