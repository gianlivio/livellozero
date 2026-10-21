import type { Metadata } from "next";
import { RichText } from "@payloadcms/richtext-lexical/react";
import type { Lingua } from "@/lib/lingue";
import { haTesto, leggiProgetto } from "@/lib/pagine";
import { testi } from "@/lib/testi";

export function metadatiProgetto(lingua: Lingua): Metadata {
  const t = testi(lingua);
  return {
    title: t.titoloPagina(t.progettoTitolo),
    description: t.progettoDescrizione,
  };
}

export default async function PaginaProgetto({ lingua }: { lingua: Lingua }) {
  const t = testi(lingua);
  const pagina = await leggiProgetto(lingua);

  return (
    <section className="guscio pagina-progetto">
      <h1>{pagina.titolo}</h1>
      {haTesto(pagina.testo) && (
        <RichText className="progetto-corpo" data={pagina.testo!} />
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
