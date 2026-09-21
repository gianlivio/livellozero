import type { Metadata } from "next";
import { RichText } from "@payloadcms/richtext-lexical/react";
import { haTesto, leggiProgetto } from "@/lib/pagine";

export const metadata: Metadata = {
  title: "Il progetto — Livello Zero",
  description: "Cos'è Livello Zero e come è nato.",
};

export default async function ProgettoPagina() {
  const pagina = await leggiProgetto();

  return (
    <section className="guscio pagina-progetto">
      <h1>{pagina.titolo}</h1>
      {haTesto(pagina.testo) && (
        <RichText className="progetto-corpo" data={pagina.testo!} />
      )}
      {(pagina.donazioniTesto || pagina.donazioniLink) && (
        <div className="progetto-sostegno">
          <h2>Sostieni il progetto</h2>
          {pagina.donazioniTesto && <p>{pagina.donazioniTesto}</p>}
          {pagina.donazioniLink && (
            <a href={pagina.donazioniLink} className="pulsante-accento">
              Offrimi un caffè
            </a>
          )}
        </div>
      )}
    </section>
  );
}
