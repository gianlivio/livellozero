import type { Metadata } from "next";
import { RichText } from "@payloadcms/richtext-lexical/react";
import { haTesto, leggiProgetto } from "@/lib/pagine";
import { testi } from "@/lib/testi";

export const metadata: Metadata = {
  title: testi().titoloPagina(testi().progettoTitolo),
  description: testi().progettoDescrizione,
};

export default async function ProgettoPagina() {
  const t = testi();
  const pagina = await leggiProgetto();

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
